import {
  difference,
  filter,
  fromEntries,
  identity,
  indexBy,
  isIncludedIn,
  mapValues,
  omitBy,
  pickBy,
  sort,
  unique,
} from "remeda";
import {
  conflateMap,
  exclude,
  frequencies as frequenciesRaw,
  heisig,
  tocfl,
  type Heisig,
} from "./data.ts";
import { network, type Decomposition } from "./network.ts";
import { max } from "./utilities.ts";

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
    if (isIncludedIn(char, stack)) {
      return [];
    } else {
      if (!network[char]) {
        throw new Error(`Network doesn't have character: ${char}`);
      }
      return network[char].decomposition.length === 0
        ? [char]
        : network[char].decomposition
            .flatMap(_allNodes(network, [...stack, char]))
            .into((cs) => [char, ...cs])
            .into(unique());
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
    isIncludedIn(char, stack)
      ? 0
      : !network[char] || network[char].decomposition.length === 0
        ? 0
        : network[char].decomposition
            .map(_depth(network, [...stack, char]))
            .reduce(max, 0) + 1;

/**
 * Sorts an array of characters by decomposition depth, from lowest to
 * highest, which means that primitives come first and then characters become
 * progressively more complex.
 */
const sortByDepth = (depths: Record<string, number>) => (chars: string[]) =>
  sort(chars, (a, b) => {
    if (depths[a] === undefined || depths[b] === undefined) {
      throw new Error(`Missing one of these character depths: ${a}, ${a}`);
    }
    return depths[a] - depths[b];
  });

/**
 * Sorts an array of characters by use frequency rank, from lowest rank (highest
 * frequency) to highest rank (lowest frequency), and placing characters that
 * don't have frequency information at the back.
 */
const sortByFrequency =
  (frequencies: Record<string, number>) => (chars: string[]) => {
    return sort(chars, (a, b) =>
      frequencies[a] === undefined && frequencies[b] === undefined
        ? 0
        : frequencies[a] === undefined
          ? 1
          : frequencies[b] === undefined
            ? -1
            : frequencies[a] - frequencies[b],
    );
  };

const isHeisigComponent = (hc: Heisig) => hc.heisigIndex === "c";

/**
 * All Heisig characters, without primitive components.
 */
export const heisigCharacters: string[] = omitBy(
  heisig,
  isHeisigComponent,
).into(Object.keys);

/**
 * All Heisig primitive components without the characters.
 */
export const heisigComponents = pickBy(heisig, isHeisigComponent).into(
  Object.keys,
);

/**
 * All TOCFL characters.
 */
export const tocflCharacters = tocfl.all;

/**
 * Mapping from character to its frequency rank.
 */
const frequencies: Record<string, number> = mapValues(
  frequenciesRaw,
  (v) => v.frequencyRank,
);

/**
 * Array of 2000 most frequent characters.
 */
const frequentCharacters: string[] = pickBy(
  frequencies,
  (rank) => rank <= 2000,
).into(Object.keys);

/**
 * Removes "duplicate" characters as determined by the conflate map, which
 * defines alternative characters that shouldn't be listed twice.
 */
const conflate =
  (conflateMap: Record<string, string>) =>
  (chars: string[]): string[] =>
    chars.map((char) => conflateMap[char] ?? char).into(unique());

/**
 * All Heisig, TOCFL and most frequent characters combined. Only the characters
 * themselves.
 */
export const htfCharacters: string[] = heisigCharacters
  .concat(tocflCharacters)
  .concat(frequentCharacters)
  .into(unique())
  .into(filter((char) => !exclude.includes(char)))
  .into(conflate(conflateMap));

/**
 * All Heisig, TOCFL and most frequent characters' components combined. Only the
 * components themselves.
 */
const htfComponentsRaw: string[] = htfCharacters
  .flatMap(allNodes(network))
  .concat(heisigComponents)
  .into(unique())
  .into(conflate(conflateMap))
  .into(difference(htfCharacters));

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
 * keyed by character. 0 means it is never actually used.
 */
const htfComponentUse: Record<string, number> = htfComponentsRaw
  .map((char): [string, number] => [
    char,
    htfComponentUseRaw.filter((c) => c === char).length - 1,
  ])
  .into(fromEntries());

/**
 * H+T+F indivisible primitive components (only those actually used by a
 * character).
 */
export const htfComponents: string[] = pickBy(
  htfComponentUse,
  (use) => use > 0,
).into(Object.keys);

/**
 * Maximum amount of times each H+T+F character can be decomposed into smaller
 * and smaller components, until we reach an indivisible primitive. Keyed by
 * character.
 */
const depths: Record<string, number> = htfCharacters
  .concat(htfComponents)
  .into(indexBy(identity()))
  .into(mapValues(depth(network)));

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
  (acc: string[], char) =>
    allNodes(network)(char)
      .filter((c) => charactersAndComponents.includes(c))
      .into(difference(acc))
      .into(sortByDepth(depths))
      .into((cs) => acc.concat(cs)),
  [],
);

/**
 * All selected characters (no primitive components), sorted by learning order.
 */
const charactersSorted: string[] = charactersAndComponentsSorted.filter(
  isIncludedIn(htfCharacters),
);

/**
 * All selected primitive components, sorted by learning order.
 */
const componentsSorted: string[] = charactersAndComponentsSorted.filter(
  isIncludedIn(htfComponents),
);

/**
 * All selected characters' study order information, indexed by character.
 */
const charactersResult: Record<string, Character> = indexBy(
  charactersAndComponentsSorted,
  identity(),
).into(
  mapValues(
    (c): Character => ({
      studyOrder: charactersAndComponentsSorted.indexOf(c) + 1,
      charactersOnlyStudyOrder: charactersSorted.indexOf(c) + 1,
      isComponent: componentsSorted.includes(c),
    }),
  ),
);

export {
  charactersSorted as characters,
  componentsSorted as components,
  charactersAndComponentsSorted as charactersAndComponents,
  charactersResult as characterData,
};
