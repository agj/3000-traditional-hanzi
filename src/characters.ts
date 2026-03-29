import {
  append,
  filter,
  flatten,
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
  vocabulary: Vocabulary[];
} & Partial<selection.Character> &
  data.Readings &
  data.Cangjie &
  Partial<data.Frequency> &
  data.Variants &
  Partial<data.Heisig> &
  Partial<data.Conflated>;

type Vocabulary = {
  word: string;
  pinyin: string;
  zhuyin: string;
};

const cedict = cedictLookup.loadTraditional("data/external/cedict_ts.u8");

const zhuyinDiacritics = ["ˊ", "ˇ", "`", "˙"];

const patchEntry = (patches: Record<string, data.Patch>) => (entry: Merged) => {
  const patch = patches[entry.traditional];
  return patch ? mergeRight(entry, patch) : entry;
};
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
      const zys = pys.map(zhuyin.fromPinyinSyllable).map((zy) => {
        const lastChar = last(zy);
        return lastChar && zhuyinDiacritics.includes(lastChar) ? zy : zy + " ";
      });
      return {
        word: w,
        pinyin: pys.join(""),
        zhuyin: zys.join(""),
      };
    });

const compileData = (char: string): Merged => {
  const ensureDefined = <T,>(value: T, datum: string) => {
    if (value === undefined) {
      throw new Error(
        `"${datum}" data to compile was not found for character: ${char}`,
      );
    }
    return value;
  };
  return mergeAll([
    { traditional: char },
    { vocabulary: getVocabulary(char) },
    selectionData[char] ?? {},
    data.frequencies[char] ?? {},
    data.variants[char] ?? { simplified: [] },
    data.heisig[char] ?? {},
    data.conflated[char] ?? {},
    ensureDefined(data.readings[char], "readings"),
    ensureDefined(data.cangjie[char], "cangjie"),
  ]);
};

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
