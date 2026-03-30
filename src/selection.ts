import {
  append,
  concat,
  filter,
  fromPairs,
  gte,
  identity,
  includes,
  indexBy,
  keys,
  map,
  max,
  prepend,
  reject,
  sort,
  uniq,
  without,
} from "ramda";
import {
  conflateMap,
  exclude,
  frequencies as frequenciesRaw,
  heisig,
  tocfl,
  type Heisig,
} from "./data.js";
import { network, type Decomposition } from "./network.js";

export type Character = {
  studyOrder: number;
  charactersOnlyStudyOrder: number;
  isComponent: boolean;
};

/**
 * Gets all decomposition components as a flat array for a given character.
 */
export const allNodes =
  (network: Record<string, Decomposition>) =>
  (char: string): string[] =>
    _allNodes(network, [])(char);
const _allNodes =
  (network: Record<string, Decomposition>, stack: string[]) =>
  (char: string): string[] => {
    if (includes(char, stack)) {
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
    includes(char, stack)
      ? 0
      : !network[char] || network[char].decomposition.length === 0
        ? 0
        : network[char].decomposition
            .map(_depth(network, append(char, stack)))
            // The following `as` is due to inexact typing of the `max` function.
            .reduce((a, b) => max(a, b) as number, 0) + 1;

/**
 * Sorts an array of characters by decomposition depth, from lowest to
 * highest, which means that primitives come first and then characters become
 * progressively more complex.
 */
const sortByDepth = (depths: Record<string, number>) => (chars: string[]) =>
  sort((a, b) => {
    if (depths[a] === undefined || depths[b] === undefined) {
      throw new Error(`Missing one of these character depths: ${a}, ${a}`);
    }
    return depths[a] - depths[b];
  }, chars);

/**
 * Sorts an array of characters by use frequency rank, from lowest rank (highest
 * frequency) to highest rank (lowest frequency), and placing characters that
 * don't have frequency information at the back.
 */
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
              : frequencies[a] - frequencies[b],
      chars,
    );
  };

const isHeisigComponent = (hc: Heisig) => hc.heisigIndex === "c";

/**
 * All Heisig characters, without primitive components.
 */
export const heisigCharacters: string[] = reject(
  isHeisigComponent,
  heisig,
).into(keys);

/**
 * All Heisig primitive components without the characters.
 */
export const heisigComponents = filter(isHeisigComponent, heisig).into(keys);

/**
 * All TOCFL characters.
 */
export const tocflCharacters = tocfl.all;

/**
 * Mapping from character to its frequency rank.
 */
const frequencies: Record<string, number> = map(
  (v) => v.frequencyRank,
  frequenciesRaw,
);

/**
 * Array of 2000 most frequent characters.
 */
const frequentCharacters: string[] = filter((f) => f <= 2000, frequencies).into(
  keys,
);

/**
 * Removes "duplicate" characters as determined by the conflate map, which
 * defines alternative characters that shouldn't be listed twice.
 */
const conflate =
  (conflateMap: Record<string, string>) =>
  (chars: string[]): string[] =>
    chars.map((char) => conflateMap[char] ?? char).into((cs) => uniq(cs));

/**
 * All Heisig, TOCFL and most frequent characters combined. Only the characters
 * themselves.
 */
export const htfCharacters: string[] = heisigCharacters
  .concat(tocflCharacters)
  .concat(frequentCharacters)
  .into((cs) => uniq(cs))
  .into((cs) => reject((c) => includes(c, exclude), cs))
  .into(conflate(conflateMap));

/**
 * All Heisig, TOCFL and most frequent characters' components combined. Only the
 * components themselves.
 */
const htfComponentsRaw: string[] = htfCharacters
  .flatMap(allNodes(network))
  .concat(heisigComponents)
  .into((cs) => uniq(cs))
  .into(conflate(conflateMap))
  .into(without(htfCharacters));

/**
 * Flat list of all decomposition data for all H+T+F, concatenated
 * together, including repeats.
 */
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

/**
 * Count of usage as component in other characters for every H+T+F character,
 * keyed by character.
 */
const htfComponentUse: Record<string, number> = htfComponentsRaw
  .map((char): [string, number] => [
    char,
    htfComponentUseRaw.reduce((n, c) => (c === char ? n + 1 : n), 0),
  ])
  .into((ps) => fromPairs(ps));

/**
 * H+T+F indivisible primitive components.
 */
export const htfComponents: string[] = htfComponentUse
  .into(reject(gte(1)))
  .into(keys);

/**
 * Maximum amount of times each H+T+F character can be decomposed into smaller
 * and smaller components, until we reach an indivisible primitive. Keyed by
 * character.
 */
const depths: Record<string, number> = htfCharacters
  .concat(htfComponents)
  .into(indexBy((c: string) => c))
  .into((cs) => map(depth(network), cs));

/**
 * All selected characters and components, sorted by high use frequency.
 */
const charactersAndComponents: string[] = htfCharacters
  .concat(htfComponents)
  .into(sortByFrequency(frequencies));

/**
 * All selected characters and components, sorted by learning order.
 */
const charactersAndComponentsSorted: string[] = charactersAndComponents.reduce(
  (r: string[], char) =>
    allNodes(network)(char)
      .filter((c) => charactersAndComponents.includes(c))
      .into(without(r))
      .into(sortByDepth(depths))
      .into(concat(r)),
  [],
);

/**
 * All selected characters (no primitive components), sorted by learning order.
 */
const charactersSorted: string[] = charactersAndComponentsSorted.filter((c) =>
  htfCharacters.includes(c),
);

/**
 * All selected primitive components, sorted by learning order.
 */
const componentsSorted: string[] = charactersAndComponentsSorted.filter((c) =>
  htfComponents.includes(c),
);

/**
 * All selected characters' study order information, indexed by character.
 */
const charactersResult: Record<string, Character> = indexBy(
  identity,
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
