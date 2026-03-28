import "dot-into";
import { equals, filter, indexBy, join, keys, map, uniq } from "ramda";
import * as U from "./src/utilities.js";
import * as data from "./src/selection.js";
import { network } from "./src/network.js";

data.characters
  .flatMap(data.allNodes(network))
  .into((cs) => uniq(cs))
  .into((cs): Record<string, string> => indexBy((c: string) => c, cs))
  .into((cs) => map(data.depth(network), cs))
  .into(filter(equals(0)))
  .into(keys)
  .into(join(""))
  .into(U.log);
