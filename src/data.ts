import "dot-into";
import {
  equals,
  filter,
  has,
  identity,
  indexBy,
  keys,
  map,
  mapObjIndexed,
  replace,
  split,
  uniq,
  values,
  without,
} from "ramda";
import wanakana from "wanakana";
import xre from "xregexp";
import * as zhuyin from "zhuyin";
import * as U from "./utilities.js";

type Unihan = Record<string, string>;

type Readings = {
  pinyin: string;
  zhuyin: string;
  japaneseKun: string;
  japaneseOn: string;
  meaning: string;
};

type Cangjie = { cangjie: string };

type Variants = { simplified: string[] };

type Frequency = { frequencyRank: number; frequencyRaw: number };

type Heisig = { heisigKeyword: string; heisigIndex: string };

type Conflated = { conflated: string[] };

const unicodeToChar = (code: string) =>
  String.fromCodePoint(parseInt(code.substring(2), 16));
const getUnihanFile = (filename: string): Record<string, Unihan> =>
  U.getFile(filename)
    .map(split("\t"))
    .reduce((obj: Record<string, Unihan>, [code, key, value]) => {
      if (!code || !key || !value) {
        throw new Error("Unihan file line is in wrong format");
      }
      const char = unicodeToChar(code);
      if (!obj[char]) {
        obj[char] = {};
      }
      obj[char][key] = value;
      return obj;
    }, {});
const removeNonHan = replace(xre("\\P{Han}", "ug"), "");
const getTocflFileWords = (level: number): string[] =>
  U.getFile(`data/external/tocfl/vocabulary-${level}.txt`).into((ls) =>
    uniq(ls),
  );
const getTocflFileCharacters = (level: number): string[] =>
  U.getFile(`data/external/tocfl/vocabulary-${level}.txt`)
    .flatMap((s) => removeNonHan(s).split(""))
    .into((ls) => uniq(ls));

type CangjieKey = keyof typeof cangjieMap;

const cangjieMap = {
  A: "日",
  B: "月",
  C: "金",
  D: "木",
  E: "水",
  F: "火",
  G: "土",
  H: "竹",
  I: "戈",
  J: "十",
  K: "大",
  L: "中",
  M: "一",
  N: "弓",
  O: "人",
  P: "心",
  Q: "手",
  R: "口",
  S: "尸",
  T: "廿",
  U: "山",
  V: "女",
  W: "田",
  Y: "卜",
  X: "難",
} as const;
const asCangjieKey = (key: string): CangjieKey => {
  if (!(key in cangjieMap)) {
    throw new Error(`Key not found in cangjieMap: ${key}`);
  }
  return key as CangjieKey;
};
const cangjieKeyToName = (key: CangjieKey): string => {
  return cangjieMap[key];
};
const cangjieKeystoNames = (keys: string) =>
  keys
    .split("")
    .map((key) => cangjieKeyToName(asCangjieKey(key)))
    .join("");

export const readings: Record<string, Readings> = getUnihanFile(
  "data/external/unihan/Unihan_Readings.txt",
).into((unihan) =>
  map((o: Unihan): Readings => {
    const py = o["kMandarin"] ?? "";
    const pys = py.split(" ");
    const zy = pys.map((py_) => zhuyin.fromPinyin(py_)).join(" ");
    return {
      pinyin: py,
      zhuyin: zy,
      japaneseKun: has("kJapaneseKun", o)
        ? wanakana.toHiragana(o["kJapaneseKun"])
        : "",
      japaneseOn: has("kJapaneseOn", o)
        ? wanakana.toKatakana(o["kJapaneseOn"])
        : "",
      meaning: o["kDefinition"] ?? "",
    };
  }, unihan),
);
export const cangjie: Record<string, Cangjie> = getUnihanFile(
  "data/external/unihan/Unihan_DictionaryLikeData.txt",
).into((unihan) =>
  map(
    (o): Cangjie => ({
      cangjie: o["kCangjie"] ? cangjieKeystoNames(o["kCangjie"]) : "",
    }),
    unihan,
  ),
);
export const variants: Record<string, Variants> = getUnihanFile(
  "data/external/unihan/Unihan_Variants.txt",
).into((unihan) =>
  mapObjIndexed(
    (o: Record<string, string>, char): Variants => ({
      simplified:
        "kSimplifiedVariant" in o
          ? o["kSimplifiedVariant"]
              .split(" ")
              .map(unicodeToChar)
              .filter((c) => c !== char)
          : [],
    }),
    unihan,
  ),
);
export const frequencies: Record<string, Frequency> = U.getFile(
  "data/external/frequency.txt",
)
  .map(split("\t"))
  .reduce((obj: Record<string, Frequency>, [char, freq, ..._], index) => {
    if (!char || !freq) {
      throw new Error("Some frequency data has the wrong format");
    }
    obj[char] = { frequencyRank: index + 1, frequencyRaw: parseInt(freq) };
    return obj;
  }, {});
export const heisig: Record<string, Heisig> = U.getFile(
  "data/external/heisig-traditional.txt",
)
  .map(split("\t"))
  .reduce((obj: Record<string, Heisig>, [idx, chr, kwd]) => {
    if (!idx || !chr || !kwd) {
      throw new Error("Some heisig data has the wrong format");
    }
    obj[chr] = { heisigKeyword: kwd, heisigIndex: idx };
    return obj;
  }, {});
export const tocflWords: Record<number | "all", string[]> = [
  1, 2, 3, 4, 5, 6, 7,
].reduce(
  (r: Record<number | "all", string[]>, level) => {
    r[level] = getTocflFileWords(level).into(without(r.all));
    r.all = r.all.concat(r[level]);
    return r;
  },
  { all: [] },
);
export const tocfl: Record<number | "all", string[]> = [
  1, 2, 3, 4, 5, 6, 7,
].reduce(
  (r: Record<number | "all", string[]>, level) => {
    r[level] = getTocflFileCharacters(level).into(without(r.all));
    r.all = r.all.concat(r[level]);
    return r;
  },
  { all: [] },
);
export const patches: Record<string, Record<string, unknown>> = U.getFile(
  "data/patches.txt",
)
  .map(split("\t"))
  .reduce(
    (obj: Record<string, Record<string, unknown>>, [char, key, value]) => {
      if (!char || !key || !value) {
        throw new Error("Patches file line is in wrong format");
      }
      obj[char] = { [key]: JSON.parse(value) };
      return obj;
    },
    {},
  );
export const exclude: string[] = U.getFile("data/exclude.txt");
export const conflateMap: Record<string, string> = U.getFile(
  "data/conflate.txt",
)
  .map(split("\t"))
  .reduce((obj: Record<string, string>, [char, conf]) => {
    if (!char || !conf) {
      throw new Error("Conflate file line is in wrong format");
    }
    obj[char] = conf;
    return obj;
  }, {});
export const conflated: Record<string, Conflated> = values(conflateMap)
  .into((v) => uniq(v))
  .into((v) => indexBy(identity, v))
  .into((v) =>
    map(
      (char: string): Conflated => ({
        conflated: conflateMap.into(filter(equals(char))).into(keys),
      }),
      v,
    ),
  );
