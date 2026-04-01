import "dot-into";
import { last, prop } from "ramda";
import fs from "fs";
import pinyin from "pinyin-utils";
import { characters, type Merged } from "./characters.ts";

/**
 * Converts character data into a TSV row.
 */
const characterToTsvRow = (o: Merged) => {
  const lastPinyin = last(o.pinyin.split(" "));

  if (lastPinyin === undefined) {
    throw new Error(`Character has no pinyin information: ${o.traditional}`);
  }

  return [
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
    "[sound:agj-pinyin-" + pinyinToFile(lastPinyin) + ".mp3]",
    o.frequencyRank,
    o.cangjie,
    o.heisigIndex,
    o.zhuyin ? o.zhuyin.split(" ").into(last) : "",
    o.vocabulary.map(prop("zhuyin")).join("  "),
  ].join("\t");
};

/**
 * Converts a pinyin syllable to a representation suitable for using in a
 * filename.
 */
const pinyinToFile = (py: string): string => {
  let r = py
    .replace(/^(\S+).*$/, "$1")
    .into((m) => pinyin.markToNumber(m))
    .replace(/ü/g, "uu");
  if (/\D$/.test(r)) r = r + "1";
  return r;
};

const tsvLines = Object.values(characters).map(characterToTsvRow);

fs.writeFileSync("output/notes.tsv", tsvLines.join("\n"), "utf-8");
