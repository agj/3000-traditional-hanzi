import "dot-into";
import { equals, filter, indexBy, join, keys, map, uniq } from "ramda";
import { log } from "./src/utilities.js";
import { allNodes, characters, depth } from "./src/selection.js";
import { network } from "./src/network.js";

characters
  .flatMap(allNodes(network))
  .into((cs) => uniq(cs))
  .into((cs): Record<string, string> => indexBy((c: string) => c, cs))
  .into((cs) => map(depth(network), cs))
  .into(filter(equals(0)))
  .into(keys)
  .into(join(""))
  .into(log);
