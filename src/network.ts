import "dot-into";
import {
  concat,
  includes,
  filter,
  has,
  map,
  mergeWith,
  pipe,
  replace,
  split,
  trim,
  uniq,
} from "ramda";
import fs from "fs";
import xre from "xregexp";

export type Decomposition = { character: string; decomposition: string[] };

const getFile = (filename: string) =>
  fs.readFileSync(filename, "utf-8").split("\n").filter(notEmptyLine);
const notEmptyLine = pipe(
  trim,
  (line) => line.length > 0 && line[0] !== "#" && !/^\/\*/.test(line),
);
const stripNonHan = replace(xre("\\P{Han}", "gA"), "");
const getIdsFile = (
  filename: string,
  preprocess: (s: string[]) => [string, string],
) =>
  getFile(filename)
    .map(split("\t"))
    .map(preprocess)
    .reduce((obj: Record<string, Decomposition>, [char, dec]) => {
      obj[char] = {
        character: char,
        decomposition: stripNonHan(dec)
          .split("")
          .filter((c) => c !== char)
          .into((v) => uniq(v)),
      };
      return obj;
    }, {});

const ids = getIdsFile("data/external/ids.txt", ([_, char, ...decs]) => {
  if (!char) {
    throw new Error("IDs file line has wrong format");
  }
  return [char, decs.reduce(concat, "")];
});
const wrongAnalysisCats = ["簡体", "或字"];
const idsAnalysis = getIdsFile(
  "data/external/ids-analysis.txt",
  ([_, char, dec, cat]) => {
    if (!char || !dec) {
      throw new Error("IDs analysis file line has wrong format");
    }
    return [char, includes(cat, wrongAnalysisCats) ? "" : dec];
  },
);
const reCjkDecomp = /^(.+):.+\((.+)\)$/u;
const redefineNumeric =
  (mapping: Record<string, Decomposition>) =>
  (component: string): string[] =>
    /\d+/.test(component)
      ? (mapping[component]?.decomposition
          .flatMap(redefineNumeric(mapping))
          .into((v) => uniq(v)) ?? [])
      : [component];
const cjkDecomp = getFile("data/external/cjk-decomp.txt")
  .map((l): [string, string[]] => [
    l.replace(reCjkDecomp, "$1"),
    l.replace(reCjkDecomp, "$2").split(","),
  ])
  .reduce((obj: Record<string, Decomposition>, [char, dec]) => {
    obj[char] = { character: char, decomposition: dec };
    return obj;
  }, {})
  .into((all: Record<string, Decomposition>) =>
    filter((o: Decomposition) => !/\d+/.test(o.character), all).into(
      (decompositions) =>
        map(
          (o: Decomposition): Decomposition => ({
            character: o.character,
            decomposition: o.decomposition
              .flatMap(redefineNumeric(all))
              .into((v) => uniq(v)),
          }),
          decompositions,
        ),
    ),
  );

const mergeDecompositions = (a: Decomposition, b: Decomposition) => ({
  character: a.character,
  decomposition: concat(a.decomposition, b.decomposition).into(uniq),
});

export const network: Record<string, Decomposition> = mergeWith(
  mergeDecompositions,
  ids,
  idsAnalysis,
)
  .into(mergeWith(mergeDecompositions, cjkDecomp))
  .into(
    map((c: Decomposition) => ({
      character: c.character,
      decomposition: c.decomposition.filter(
        (c) => has(c, ids) || has(c, idsAnalysis) || has(c, cjkDecomp),
      ),
    })),
  );
