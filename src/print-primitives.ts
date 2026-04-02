//
// This script prints all primitives, components with a network depth of 0, i.e.
// those which cannot be themselves decomposed any further, at least according
// to the data.
//

import "dot-into";
import { identity, indexBy, join, mapValues, pickBy, unique } from "remeda";
import { log } from "./utilities.ts";
import { allNodes, characters, depth } from "./selection.ts";
import { network } from "./network.ts";

characters
  .flatMap(allNodes(network))
  .into(unique())
  .into(indexBy(identity()))
  .into(mapValues(depth(network)))
  .into(pickBy((depth) => depth === 0))
  .into(Object.keys)
  .into(join(""))
  .into(log);
