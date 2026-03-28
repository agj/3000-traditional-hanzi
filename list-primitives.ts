import "dot-into";
import {
  append,
  contains,
  curry,
  equals,
  filter,
  indexBy,
  join,
  keys,
  map,
  max,
  prepend,
  uniq,
} from "ramda";
import * as U from "./src/utilities.js";
import * as data from "./src/selection.js";
import { network, type Decomposition } from "./src/network.js";

const allNodes = curry((network: Record<string, Decomposition>, char: string) =>
  _allNodes(network, [])(char),
);
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
const depth =
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

data.characters
  .flatMap(allNodes(network))
  .into((cs) => uniq(cs))
  .into((cs) => indexBy((c: string) => c, cs))
  .into((cs) => map(depth(network), cs))
  .into(filter(equals(0)))
  .into(keys)
  .into(join(""))
  .into(U.log);
