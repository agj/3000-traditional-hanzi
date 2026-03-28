import R from "ramda";
import pinyin from "pinyin-utils";
import * as zhuyin from "zhuyin";
import cedictLookup from "cedict-lookup";
import * as U from "./utilities";
import * as selection from "./selection";
import * as data from "./data";
import { characterData as selectionData } from "./selection";

const cedict = cedictLookup.loadTraditional("data/external/cedict_ts.u8");

const zhuyinDiacritics = ["ˊ", "ˇ", "`", "˙"];

const patchEntry = R.curry((patches, entry) =>
  R.has(entry.traditional, patches)
    ? R.merge(entry, patches[entry.traditional])
    : entry,
);

const getVocabulary = (char) =>
  data.tocflWords
    .into(R.omit(["all"]))
    .into(R.values)
    .map(R.filter((w) => w.replace(char, "") !== w))
    .into(R.flatten)
    .into(R.filter((w) => w.length > 1 && cedict.getMatch(w).length > 0))
    .into(R.take(3))
    .map((w) => {
      const pys = cedict
        .getMatch(w)[0]
        .pinyin.split(" ")
        .map(R.replace(/u:/g, "ü"))
        .map(pinyin.numberToMark);
      const zys = pys
        .map(zhuyin.fromPinyinSyllable)
        .map((zy) => (zhuyinDiacritics.includes(R.last(zy)) ? zy : zy + " "));
      return {
        word: w,
        pinyin: pys.join(""),
        zhuyin: zys.join(""),
      };
    });

const compileData = (char) =>
  R.mergeAll([
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

const expand = (chars) =>
  chars
    .into(R.indexBy(R.identity))
    .into(R.map(compileData))
    .into(
      R.map((o) =>
        o.conflated
          ? o.conflated.map(compileData).into(R.append(o)).into(R.mergeAll)
          : o,
      ),
    )
    .into(R.map(patchEntry(data.patches)));

export default expand(selection.characters);
