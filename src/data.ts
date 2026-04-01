import "dot-into";
import {
  equals,
  filter,
  identity,
  indexBy,
  keys,
  map,
  mapObjIndexed,
  split,
  uniq,
  values,
  without,
} from "ramda";
import { toHiragana, toKatakana } from "wanakana";
import * as z from "zod";
import * as zhuyin from "zhuyin";
import { getFile, stripNonHan } from "./utilities.ts";

// Types.

type Unihan = {
  [key in UnihanKey]?: string;
};

type UnihanKey = z.output<typeof unihanKeySchema>;

export type Readings = {
  pinyin: string;
  zhuyin: string;
  japaneseKun: string;
  japaneseOn: string;
  meaning: string;
};

export type Cangjie = { cangjie: string };

type CangjieKey = keyof typeof cangjieKeyToHanziMap;

export type Variants = { simplified: string[] };

export type Frequency = { frequencyRank: number; frequencyRaw: number };

export type Heisig = { heisigKeyword: string; heisigIndex: string };

export type Conflated = { conflated: string[] };

export type Patch = Cangjie | Variants | { meaning: string };

// Unihan utilities.

/**
 * Matches a single row of Unihan data split as an array of strings.
 */
const unihanRowSchema = z.tuple([z.string(), z.string(), z.string()]);

/**
 * Matches a Unihan key.
 */
const unihanKeySchema = z.enum([
  "kJapaneseKun",
  "kJapaneseOn",
  "kMandarin",
  "kDefinition",
  "kCangjie",
  "kSimplifiedVariant",
]);

/**
 * Converts a unicode codepoint to its corresponding character.
 */
const unicodeToChar = (code: string) =>
  String.fromCodePoint(parseInt(code.substring(2), 16));

/**
 * Reads a Unihan data file by its filename, as a record mapping characters with
 * their Unihan data.
 */
const getUnihanFile = (filename: string): Record<string, Unihan> =>
  getFile(filename)
    .map(split("\t"))
    .reduce((obj: Record<string, Unihan>, row) => {
      const parsedRow = unihanRowSchema.safeParse(row);
      if (!parsedRow.success) {
        throw new Error("Unihan file line has wrong format");
      }
      const [code, keyRaw, value] = parsedRow.data;
      const char = unicodeToChar(code);
      if (!obj[char]) {
        obj[char] = {};
      }
      const keyParsed = unihanKeySchema.safeParse(keyRaw);
      if (keyParsed.success) {
        obj[char][keyParsed.data] = value;
      }
      return obj;
    }, {});

// Patch utilities.

/**
 * Matches a single row of patch file data split as an array of strings.
 */
const patchRowSchema = z.tuple([
  z.string(),
  z.enum(["meaning", "simplified", "cangjie"]),
  z.string(),
]);

/**
 * Matches the JSON value (as converted to a JS value) for a "meaning" patch.
 */
const patchMeaningValueSchema = z.string();

/**
 * Matches the JSON value (as converted to a JS value) for a "simplified" patch.
 */
const patchSimplifiedValueSchema = z.array(z.string());

/**
 * Matches the JSON value (as converted to a JS value) for a "cangjie" patch.
 */
const patchCangjieValueSchema = z.string();

// TOCFL utilities.

/**
 * Reads the TOCFL file data for a given level. Returns an array of words.
 */
const getTocflFileWords = (level: number): string[] =>
  getFile(`data/external/tocfl/vocabulary-${level}.txt`).into(uniq);

/**
 * Gets all unique characters used in a given TOCFL level.
 */
const getTocflFileCharacters = (level: number): string[] =>
  getFile(`data/external/tocfl/vocabulary-${level}.txt`)
    .flatMap((s) => stripNonHan(s).split(""))
    .into(uniq);

// Cangjie utilities.

/**
 * Map from the Unihan key used for cangjie (latin letters) to its hanzi
 * equivalent.
 */
const cangjieKeyToHanziMap = {
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

/**
 * Asserts that a string is a `CangjieKey` and returns it correctly typed.
 */
const asCangjieKey = (key: string): CangjieKey => {
  if (!(key in cangjieKeyToHanziMap)) {
    throw new Error(`Key not found in cangjieMap: ${key}`);
  }
  return key as CangjieKey;
};

/**
 * Converts a Unihan cangjie key (latin letter) to its hanzi equivalent.
 */
const cangjieKeyToName = (key: CangjieKey): string => {
  return cangjieKeyToHanziMap[key];
};

/**
 * Converts a cangjie sequence in latin letters to its hanzi equivalent.
 */
const cangjieKeysToNames = (keys: string) =>
  keys
    .split("")
    .map((key) => cangjieKeyToName(asCangjieKey(key)))
    .join("");

// Character data.

/**
 * All Unihan readings keyed by character.
 */
export const readings: Record<string, Readings> = getUnihanFile(
  "data/external/unihan/Unihan_Readings.txt",
).into((unihan) =>
  map((o: Unihan): Readings => {
    const py = o.kMandarin ?? "";
    const pys = py.split(" ");
    const zy = pys.map((py_) => zhuyin.fromPinyin(py_)).join(" ");
    return {
      pinyin: py,
      zhuyin: zy,
      japaneseKun: o.kJapaneseKun ? toHiragana(o.kJapaneseKun) : "",
      japaneseOn: o.kJapaneseOn ? toKatakana(o.kJapaneseOn) : "",
      meaning: o.kDefinition ?? "",
    };
  }, unihan),
);

/**
 * All cangjie information, keyed by character.
 */
export const cangjie: Record<string, Cangjie> = getUnihanFile(
  "data/external/unihan/Unihan_DictionaryLikeData.txt",
).into((unihan) =>
  map(
    (o): Cangjie => ({
      cangjie: o.kCangjie ? cangjieKeysToNames(o.kCangjie) : "",
    }),
    unihan,
  ),
);

/**
 * All character variant information, keyed by character.
 */
export const variants: Record<string, Variants> = getUnihanFile(
  "data/external/unihan/Unihan_Variants.txt",
).into((unihan) =>
  mapObjIndexed(
    (o, char): Variants => ({
      simplified: o.kSimplifiedVariant
        ? o.kSimplifiedVariant
            .split(" ")
            .map(unicodeToChar)
            .filter((c) => c !== char)
        : [],
    }),
    unihan,
  ),
);

/**
 * All charavter usage frequency, keyed by character.
 */
export const frequencies: Record<string, Frequency> = getFile(
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

/**
 * All Heisig data, keyed by character.
 */
export const heisig: Record<string, Heisig> = getFile(
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

/**
 * All TOCFL vocabulary words, keyed by level.
 */
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

/**
 * All TOCFL characters, keyed by level.
 */
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

/**
 * All character patch information, keyed by character.
 */
export const patches: Record<string, Patch> = getFile("data/patches.txt")
  .map(split("\t"))
  .reduce((obj: Record<string, Patch>, row) => {
    const parsedRow = patchRowSchema.safeParse(row);
    if (!parsedRow.success) {
      throw new Error("Patches file line is in wrong format");
    }
    const [char, key, valueStr] = parsedRow.data;
    const value: unknown = JSON.parse(valueStr);
    if (key === "meaning") {
      obj[char] = { [key]: patchMeaningValueSchema.parse(value) };
    } else if (key === "simplified") {
      obj[char] = { [key]: patchSimplifiedValueSchema.parse(value) };
    } else if (key === "cangjie") {
      obj[char] = { [key]: patchCangjieValueSchema.parse(value) };
    } else {
      throw new Error(`No parsing known for patch key: ${key}`);
    }
    return obj;
  }, {});

/**
 * All characters to exclude.
 */
export const exclude: string[] = getFile("data/exclude.txt");

/**
 * Character conflation mappings, where the key is the character to be conflated
 * into the character in the value.
 */
export const conflateMap: Record<string, string> = getFile("data/conflate.txt")
  .map(split("\t"))
  .reduce((obj: Record<string, string>, [char, conf]) => {
    if (!char || !conf) {
      throw new Error("Conflate file line is in wrong format");
    }
    obj[char] = conf;
    return obj;
  }, {});

/**
 * All character conflation data, keyed by character.
 */
export const conflated: Record<string, Conflated> = values(conflateMap)
  .into(uniq)
  .into(indexBy(identity))
  .into((v) =>
    map(
      (char: string): Conflated => ({
        conflated: conflateMap.into(filter(equals(char))).into(keys),
      }),
      v,
    ),
  );
