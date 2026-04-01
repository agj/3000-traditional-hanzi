import "dot-into";
import { uniq } from "ramda";
import fs from "fs";
import {
  characters,
  components,
  heisigCharacters,
  htfCharacters,
  htfComponents,
  tocflCharacters,
} from "./selection.ts";

const { out, print } = (() => {
  let output = "";

  return {
    /**
     * Queues up a line of output text.
     */
    out: (...msg: (string | number)[]) =>
      (output = output + msg.join(" ") + "\n"),
    /**
     * Recovers all queued output text.
     */
    print: () => output,
  };
})();

out("Heisig (H):", heisigCharacters.length);
out("TOCFL (T):", tocflCharacters.length);
out(
  "Heisig + TOCFL:",
  heisigCharacters.concat(tocflCharacters).into(uniq).length,
);
out("Heisig + TOCFL + 2000 most frequent (F):", htfCharacters.length);
out("H+T+F components:", htfComponents.length);
out("");
out("All H+T+F components sorted:");
out(components.join(""));
out("");
out("All H+T+F characters sorted (no components):");
out(characters.join(""));

fs.writeFileSync("output/stats.txt", print(), "utf-8");
