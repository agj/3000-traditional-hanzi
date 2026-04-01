import "dot-into";
import {
  equals,
  filter,
  identity,
  indexBy,
  join,
  keys,
  map,
  uniq,
} from "ramda";
import { log } from "./utilities.ts";
import { allNodes, characters, depth } from "./selection.ts";
import { network } from "./network.ts";

characters
  .flatMap(allNodes(network))
  .into(uniq)
  .into(indexBy(identity))
  .into((cs) => map(depth(network), cs))
  .into(filter(equals(0)))
  .into(keys)
  .into(join(""))
  .into(log);
