import "dot-into";
import { last, prop, map, values } from "ramda";
import fs from "fs";
import pinyin from "pinyin-utils";
import characters from "./src/characters";
import * as U from "./src/utilities";

const toStringEntry = (o) =>
  [
    o.traditional,
    o.charactersOnlyStudyOrder,
    o.conflated ? o.conflated.join("") : "",
    o.simplified ? o.simplified.join("") : "",
    o.pinyin ? o.pinyin.split(" ").into(last) : "",
    o.heisigKeyword,
    o.meaning,
    o.vocabulary.map(prop("word")).join(" "),
    o.vocabulary.map(prop("pinyin")).join(" "),
    o.japaneseKun,
    o.japaneseOn,
    "[sound:agj-pinyin-" +
      pinyinToFile(o.pinyin ? o.pinyin.split(" ").into(last) : "") +
      ".mp3]",
    o.frequencyRank,
    o.cangjie,
    o.heisigIndex,
    o.zhuyin ? o.zhuyin.split(" ").into(last) : "",
    o.vocabulary.map(prop("zhuyin")).join("  "),
  ].join("\t");
const pinyinToFile = (py) => {
  let r = py
    .replace(/^(\S+).*$/, "$1")
    .into(pinyin.markToNumber)
    .replace(/ü/g, "uu");
  if (/\D$/.test(r)) r = r + "1";
  return r;
};

characters
  .into(map(toStringEntry))
  .into(values)
  .into((r) => {
    fs.writeFileSync("output/notes.tsv", r.join("\n"), "utf-8");
  });
