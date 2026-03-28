import R from "ramda";
import fs from "fs";

export const log = R.tap(console.log);

const notEmptyLine = R.pipe(
  R.trim,
  (line) => line.length > 0 && line[0] !== "#" && !/^\/\*/.test(line),
);

export const getFile = (filename) =>
  fs.readFileSync(filename, "utf-8").split("\n").filter(notEmptyLine);

export const whenAll = Promise.all.bind(Promise);
