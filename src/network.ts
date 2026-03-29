import "dot-into";
import { concat, includes, filter, map, mergeWith, split, uniq } from "ramda";
import { getFile, stripNonHan } from "./utilities.js";

export type Decomposition = {
  character: string;
  decomposition: string[];
};

// CJKVI data.

/**
 * Read IDS (ideographic description sequence) data from file, keyed by
 * character. Supply a function to preprocess each row (split into an array of
 * strings), into a tuple
 * `[character, decomposition]`.
 */
const getIdsFile = (
  filename: string,
  preprocess: (s: string[]) => [string, string],
): Record<string, Decomposition> =>
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

/**
 * All base IDS (ideographic description sequence) decomposition data, keyed
 * by character.
 */
const ids: Record<string, Decomposition> = getIdsFile(
  "data/external/ids.txt",
  ([_, char, ...decs]) => {
    if (!char) {
      throw new Error("IDs file line has wrong format");
    }
    return [char, decs.reduce(concat, "")];
  },
);

/**
 * IDS "analysis" file categories that don't contain decomposition information.
 */
const wrongAnalysisCats = ["簡体", "或字"];

/**
 * All IDS (ideographic description sequence) decomposition data from the
 * "analysis" file, keyed by character.
 */
const idsAnalysis = getIdsFile(
  "data/external/ids-analysis.txt",
  ([_, char, dec, cat]) => {
    if (!char || !dec) {
      throw new Error("IDs analysis file line has wrong format");
    }
    return [char, includes(cat, wrongAnalysisCats) ? "" : dec];
  },
);

// Grover data.

/**
 * Regex matching components in a Grover decomposition file's line. The first
 * capture group is the character (or numeric ID), while the second is its
 * decomposition.
 */
const reCjkDecomp = /^(.+):.+\((.+)\)$/u;

/**
 * Grover decomposition data contains many entries which are not themselves
 * characters but rather are further decompositions, and are specified as
 * numeric IDs. This function converts such ID "characters" into an array of
 * components, and for actual characters just returns a singleton array with the
 * character inside.
 */
const redefineCjkNumericId =
  (mapping: Record<string, Decomposition>) =>
  (component: string): string[] =>
    /\d+/.test(component)
      ? (mapping[component]?.decomposition
          .flatMap(redefineCjkNumericId(mapping))
          .into((v) => uniq(v)) ?? [])
      : [component];

/**
 * All Grover decomposition data, keyed by character.
 */
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
              .flatMap(redefineCjkNumericId(all))
              .into((v) => uniq(v)),
          }),
          decompositions,
        ),
    ),
  );

// Data combination.

/**
 * Merges two decompositions, ensuring there's no repeated components.
 */
const mergeDecompositions = (a: Decomposition, b: Decomposition) => ({
  character: a.character,
  decomposition: concat(a.decomposition, b.decomposition).into(uniq),
});

/**
 * Whole character decomposition into components information, keyed by
 * character.
 */
export const network: Record<string, Decomposition> = mergeWith(
  mergeDecompositions,
  ids,
  idsAnalysis,
)
  .into(mergeWith(mergeDecompositions, cjkDecomp))
  .into(
    map(
      (dec: Decomposition): Decomposition => ({
        character: dec.character,
        decomposition: dec.decomposition.filter(
          (char) => char in ids || char in idsAnalysis || char in cjkDecomp,
        ),
      }),
    ),
  );
