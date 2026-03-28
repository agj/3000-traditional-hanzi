import {
  append,
  concat,
  contains,
  curry,
  filter,
  fromPairs,
  gte,
  indexBy,
  keys,
  map,
  max,
  prepend,
  propEq,
  reject,
  sort,
  uniq,
  without,
} from "ramda";
import * as data from "./data.js";
import { network, type Decomposition } from "./network.js";

export type Character = {
  studyOrder: number;
  charactersOnlyStudyOrder: number;
  isComponent: boolean;
};

/**
 * Gets all decomposition nodes as a flat array for a given character.
 */
export const allNodes =
  (network: Record<string, Decomposition>) =>
  (char: string): string[] =>
    _allNodes(network, [])(char);
const _allNodes =
  (network: Record<string, Decomposition>, stack: string[]) =>
  (char: string): string[] => {
    if (contains(char, stack)) {
      return [];
    } else {
      if (!network[char]) {
        throw new Error(`Network doesn't have character: ${char}`);
      }
      return network[char].decomposition.length === 0
        ? [char]
        : network[char].decomposition
            .flatMap(_allNodes(network, append(char, stack)))
            .into(prepend(char))
            .into((v) => uniq(v));
    }
  };

/**
 * Gets the maximum amount of times a character can be decomposed into smaller
 * and smaller components, until we reach an indivisible primitive. A primitive
 * has depth `0`.
 */
export const depth =
  (network: Record<string, Decomposition>) =>
  (char: string): number =>
    _depth(network, [])(char);
const _depth =
  (network: Record<string, Decomposition>, stack: string[]) =>
  (char: string): number =>
    contains(char, stack)
      ? 0
      : !network[char] || network[char].decomposition.length === 0
        ? 0
        : network[char].decomposition
            .map(_depth(network, append(char, stack)))
            // The following `as` is due to inexact typing of the `max` function.
            .reduce((a, b) => max(a, b) as number, 0) + 1;
const sortByDepth = (depths: Record<string, number>) => (chars: string[]) =>
  sort((a, b) => {
    if (depths[a] === undefined || depths[b] === undefined) {
      throw new Error(`Missing one of these character depths: ${a}, ${a}`);
    }
    return depths[a] < depths[b] ? -1 : depths[a] > depths[b] ? 1 : 0;
  }, chars);
const sortByFrequency =
  (frequencies: Record<string, number>) => (chars: string[]) => {
    return sort(
      (a, b) =>
        frequencies[a] === undefined && frequencies[b] === undefined
          ? 0
          : frequencies[a] === undefined
            ? 1
            : frequencies[b] === undefined
              ? -1
              : frequencies[a] < frequencies[b]
                ? -1
                : 1,
      chars,
    );
  };
const frequenciesRaw = data.frequencies;
const heisig = data.heisig;
const tocfl = data.tocfl;
const conflateMap = data.conflateMap;

export const heisigCharacters = heisig
  .into(reject(propEq("heisigIndex", "c")))
  .into(keys);
export const heisigComponents = heisig
  .into(filter(propEq("heisigIndex", "c")))
  .into(keys);
export const tocflCharacters = tocfl.all;
const frequencies: Record<string, number> = map(
  (v) => v.frequencyRank,
  frequenciesRaw,
);
const frequentCharacters = filter((f) => f < 2000, frequencies).into(keys);

const conflate =
  (conflateMap: Record<string, string>) =>
  (chars: string[]): string[] =>
    chars
      .map((char) => (conflateMap[char] ? conflateMap[char] : char))
      .into((cs) => uniq(cs));
export const htfCharacters: string[] = heisigCharacters
  .concat(tocflCharacters)
  .concat(frequentCharacters)
  .into((cs) => uniq(cs))
  .into((cs) => reject((c) => contains(c, data.exclude), cs))
  .into(conflate(conflateMap));
const htfComponentsRaw: string[] = htfCharacters
  .flatMap(allNodes(network))
  .concat(heisigComponents)
  .into((cs) => uniq(cs))
  .into(conflate(conflateMap))
  .into(without(htfCharacters));
const htfComponentUseRaw: string[] = htfCharacters
  .concat(htfComponentsRaw)
  .flatMap((char) => {
    if (!network[char]) {
      throw new Error(
        `Decomposition information not found for character: ${char}`,
      );
    }
    return network[char].decomposition;
  });
const htfComponentUse: Record<string, number> = htfComponentsRaw
  .map((char): [string, number] => [
    char,
    htfComponentUseRaw.reduce((n, c) => (c === char ? n + 1 : n), 0),
  ])
  .into((ps) => fromPairs(ps));
export const htfComponents: string[] = htfComponentUse
  .into(reject(gte(1)))
  .into(keys);

const depths: Record<string, number> = htfCharacters
  .concat(htfComponents)
  .into(indexBy((c: string) => c))
  .into((cs) => map(depth(network), cs));
const charactersAndComponents: string[] = htfCharacters
  .concat(htfComponents)
  .into(sortByFrequency(frequencies));
const charactersAndComponentsSorted: string[] = charactersAndComponents.reduce(
  (r: string[], char) =>
    allNodes(network)(char)
      .filter((c) => charactersAndComponents.includes(c))
      .into(without(r))
      .into(sortByDepth(depths))
      .into(concat(r)),
  [],
);
const charactersSorted: string[] = charactersAndComponentsSorted.filter((c) =>
  htfCharacters.includes(c),
);
const componentsSorted: string[] = charactersAndComponentsSorted.filter((c) =>
  htfComponents.includes(c),
);

const charactersResult: Record<string, Character> = indexBy((v: string) => v)(
  charactersAndComponentsSorted,
).into((cs) =>
  map(
    (c): Character => ({
      studyOrder: charactersAndComponentsSorted.indexOf(c) + 1,
      charactersOnlyStudyOrder: charactersSorted.indexOf(c) + 1,
      isComponent: componentsSorted.includes(c),
    }),
    cs,
  ),
);

export {
  charactersSorted as characters,
  componentsSorted as components,
  charactersAndComponentsSorted as charactersAndComponents,
  charactersResult as characterData,
};
