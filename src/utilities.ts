import fs from "fs";
import { tap } from "remeda";

/**
 * Prints a value and returns it.
 */
export const log = tap(console.log);

/**
 * Checks if a line of a data file is empty or is a comment.
 */
const notEmptyLine = (line: string) => {
  const trimmed = line.trim();
  return trimmed.length > 0 && trimmed[0] !== "#" && !/^\/\*/.test(trimmed);
};

/**
 * Reads a text file by its filename, and returns it split into lines. It gets
 * rid of empty and comment lines.
 */
export const getFile = (filename: string): string[] =>
  fs.readFileSync(filename, "utf-8").split("\n").filter(notEmptyLine);

/**
 * Strips all non-hanzi content from a string.
 */
export const stripNonHan = (string: string) =>
  string.replace(/\P{Script=Han}/gv, "");

/**
 * Merge the values in two objects using a function to combine each value that
 * shares the same key in both objects.
 */
export const mergeWith = <L, R>(
  combine: (l: L, r: R) => L | R,
  l: Record<string, L>,
  r: Record<string, R>,
): Record<string, L | R> => {
  const result: Record<string, L | R> = {};

  for (const key in l) {
    result[key] = key in r ? combine(l[key] as L, r[key] as R) : (l[key] as L);
  }

  for (const key in r) {
    if (!(key in result)) {
      result[key] = r[key] as R;
    }
  }

  return result;
};

/**
 * Returns the largest among two numbers.
 */
export const max = (a: number, b: number): number => (a > b ? a : b);

/**
 * Gets the last character in a string.
 */
export const stringLastChar = (string: string): string | undefined =>
  string[string.length - 1];
