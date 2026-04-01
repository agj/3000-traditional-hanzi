import "dot-into";
import {
  identity,
  indexBy,
  isStrictEqual,
  join,
  mapValues,
  pickBy,
  unique,
} from "remeda";
import { log } from "./utilities.ts";
import { allNodes, characters, depth } from "./selection.ts";
import { network } from "./network.ts";

characters
  .flatMap(allNodes(network))
  .into(unique())
  .into(indexBy(identity()))
  .into(mapValues(depth(network)))
  .into(pickBy(isStrictEqual(0)))
  .into(Object.keys)
  .into(join(""))
  .into(log);
