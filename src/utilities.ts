import { tap, pipe, trim } from "ramda";
import fs from "fs";

export const log = tap(console.log);

const notEmptyLine = pipe(
  trim,
  (line) => line.length > 0 && line[0] !== "#" && !/^\/\*/.test(line),
);

export const getFile = (filename: string) =>
  fs.readFileSync(filename, "utf-8").split("\n").filter(notEmptyLine);

export const whenAll = Promise.all.bind(Promise);
