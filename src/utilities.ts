import { tap, pipe, trim, replace } from "ramda";
import fs from "fs";
import xre from "xregexp";

export const log = tap(console.log);

const notEmptyLine = pipe(
  trim,
  (line) => line.length > 0 && line[0] !== "#" && !/^\/\*/.test(line),
);

export const getFile = (filename: string): string[] =>
  fs.readFileSync(filename, "utf-8").split("\n").filter(notEmptyLine);

export const whenAll = Promise.all.bind(Promise);

/**
 * Strips all non-hanzi content from a string.
 */
export const stripNonHan = replace(xre("\\P{Han}", "guA"), "");
