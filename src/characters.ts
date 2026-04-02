import {
  filter,
  identity,
  indexBy,
  mapValues,
  merge,
  mergeAll,
  omit,
  pipe,
  take,
} from "remeda";
import pinyin from "pinyin-utils";
import * as zhuyin from "zhuyin";
import cedictLookup from "cedict-lookup";
import { type Character } from "./selection.ts";
import {
  cangjie,
  conflated,
  frequencies,
  heisig,
  patches,
  readings,
  tocflWords,
  variants,
  type Cangjie,
  type Conflated,
  type Frequency,
  type Heisig,
  type Patch,
  type Readings,
  type Variants,
} from "./data.ts";
import {
  characterData as selectionCharacterData,
  characters as selectionCharacters,
} from "./selection.ts";
import { stringLastChar } from "./utilities.ts";

export type Merged = {
  traditional: string;
  vocabulary: Vocabulary[];
} & Partial<Character> &
  Readings &
  Cangjie &
  Partial<Frequency> &
  Variants &
  Partial<Heisig> &
  Partial<Conflated>;

type Vocabulary = {
  word: string;
  pinyin: string;
  zhuyin: string;
};

const cedict = cedictLookup.loadTraditional("data/external/cedict_ts.u8");

const zhuyinDiacritics = ["ˊ", "ˇ", "`", "˙"];

/**
 * Puts patched information into a "merged" character data.
 */
const patchEntry =
  (patches: Record<string, Patch>) =>
  (entry: Merged): Merged => {
    const patch = patches[entry.traditional];
    return patch ? merge(entry, patch) : entry;
  };

/**
 * Gets vocabulary data for a character.
 */
const getVocabulary = (char: string): Vocabulary[] =>
  tocflWords
    .into(omit(["all"]))
    .into((v) => Object.values(v))
    .flatMap(filter((w) => w.includes(char)))
    .into(filter((w) => w.length > 1 && cedict.getMatch(w).length > 0))
    .into(take(3))
    .map((w): Vocabulary => {
      const firstMatch = cedict.getMatch(w)[0];
      if (!firstMatch) {
        throw new Error(`No cedict match found for: ${w}`);
      }
      const pys = firstMatch.pinyin
        .split(" ")
        .map((p) => p.replace(/u:/g, "ü"))
        .map((p) => pinyin.numberToMark(p));
      const zys = pys.map(zhuyin.fromPinyinSyllable).map((zy) => {
        const lastChar = stringLastChar(zy);
        return lastChar && zhuyinDiacritics.includes(lastChar) ? zy : zy + " ";
      });
      return {
        word: w,
        pinyin: pys.join(""),
        zhuyin: zys.join(""),
      };
    });

/**
 * Generates a full "merged" set of data for a given character.
 */
const compileData = (char: string): Merged => {
  /**
   * Throws if the value is undefined, with a relevant error message.
   */
  const ensureDefined = <T>(value: T, datum: string) => {
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
    selectionCharacterData[char] ?? {},
    frequencies[char] ?? {},
    variants[char] ?? { simplified: [] },
    heisig[char] ?? {},
    conflated[char] ?? {},
    ensureDefined(readings[char], "readings"),
    ensureDefined(cangjie[char], "cangjie"),
  ]);
};

/**
 * Reads conflation information from a "merged" character data and adds it into
 * the main character's data, still allowing the main character to override
 * conflated data.
 */
const mergeConflated = (o: Merged): Merged =>
  o.conflated
    ? // This is regrettable…
      (mergeAll([...o.conflated.map(compileData), o]) as Merged)
    : o;

/**
 * Expands an array of characters into full "merged" data for each.
 */
const compileDataForAll = (chars: string[]): Record<string, Merged> =>
  mapValues(indexBy(chars, identity()), (char) =>
    pipe(char, compileData, mergeConflated, patchEntry(patches)),
  );

/**
 * Full compiled data for all (selected) characters.
 */
export const characters: Record<string, Merged> =
  compileDataForAll(selectionCharacters);
