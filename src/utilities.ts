import { tap, pipe, trim, replace } from "ramda";
import fs from "fs";

/**
 * Prints a value and returns it.
 */
export const log = tap(console.log);

/**
 * Checks if a line of a data file is empty or is a comment.
 */
const notEmptyLine = pipe(
  trim,
  (line) => line.length > 0 && line[0] !== "#" && !/^\/\*/.test(line),
);

/**
 * Reads a text file by its filename, and returns it split into lines. It gets
 * rid of empty and comment lines.
 */
export const getFile = (filename: string): string[] =>
  fs.readFileSync(filename, "utf-8").split("\n").filter(notEmptyLine);

/**
 * Strips all non-hanzi content from a string.
 */
export const stripNonHan = replace(/\P{Script=Han}/gv, "");
