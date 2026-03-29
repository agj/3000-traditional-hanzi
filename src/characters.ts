import {
  append,
  filter,
  flatten,
  has,
  indexBy,
  last,
  map,
  mergeAll,
  mergeRight,
  omit,
  replace,
  take,
  values,
} from "ramda";
import pinyin from "pinyin-utils";
import * as zhuyin from "zhuyin";
import cedictLookup from "cedict-lookup";
import * as selection from "./selection.js";
import * as data from "./data.js";
import { characterData as selectionData } from "./selection.js";

type Merged = {
  traditional: string;
  vocabulary: string[];
} & selection.Character &
  data.Readings &
  data.Cangjie &
  data.Frequency &
  data.Variants &
  data.Heisig &
  data.Conflated;

type Vocabulary = {
  word: string;
  pinyin: string;
  zhuyin: string;
};

const cedict = cedictLookup.loadTraditional("data/external/cedict_ts.u8");

const zhuyinDiacritics = ["ˊ", "ˇ", "`", "˙"];

const patchEntry = (patches: Record<string, data.Patch>) => (entry: Merged) =>
  has(entry.traditional, patches)
    ? mergeRight(entry, patches[entry.traditional])
    : entry;
const getVocabulary = (char: string): Vocabulary[] =>
  data.tocflWords
    .into(omit(["all"]))
    .into(values)
    .map(filter((w: string) => w.replace(char, "") !== w))
    .into(flatten)
    .into(filter((w: string) => w.length > 1 && cedict.getMatch(w).length > 0))
    .into(take(3))
    .map((w: string): Vocabulary => {
      const firstMatch = cedict.getMatch(w)[0];
      if (!firstMatch) {
        throw new Error(`No cedict match found for: ${w}`);
      }
      const pys = firstMatch.pinyin
        .split(" ")
        .map(replace(/u:/g, "ü"))
        .map((p) => pinyin.numberToMark(p));
      const zys = pys
        .map(zhuyin.fromPinyinSyllable)
        .map((zy) => (zhuyinDiacritics.includes(last(zy)) ? zy : zy + " "));
      return {
        word: w,
        pinyin: pys.join(""),
        zhuyin: zys.join(""),
      };
    });

const compileData = (char: string): Merged =>
  mergeAll([
    { traditional: char },
    selectionData[char],
    data.readings[char],
    data.cangjie[char],
    data.frequencies[char],
    data.variants[char],
    data.heisig[char],
    data.conflated[char],
    { vocabulary: getVocabulary(char) },
  ]);

const expand = (chars: string[]) =>
  chars
    .into(indexBy((v: string) => v))
    .into((v) => map(compileData, v))
    .into(
      map((o: Merged) =>
        o.conflated
          ? o.conflated.map(compileData).into(append(o)).into(mergeAll)
          : o,
      ),
    )
    .into(map(patchEntry(data.patches)));

export default expand(selection.characters);
