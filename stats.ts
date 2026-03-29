import "dot-into";
import * as R from "ramda";
import fs from "fs";
import * as data from "./src/selection.js";

const { out, print } = (() => {
  let output = "";
  return {
    out: (...msg: (string | number)[]) =>
      (output = output + msg.join(" ") + "\n"),
    print: () => output,
  };
})();

out("Heisig (H):", data.heisigCharacters.length);
out("TOCFL (T):", data.tocflCharacters.length);
out(
  "Heisig + TOCFL:",
  data.heisigCharacters.concat(data.tocflCharacters).into(R.uniq).length,
);
out("Heisig + TOCFL + 2000 most frequent (F):", data.htfCharacters.length);
out("H+T+F components:", data.htfComponents.length);
out("");
out("All H+T+F components sorted:");
out(data.components.join(""));
out("");
out("All H+T+F characters sorted (no components):");
out(data.characters.join(""));

fs.writeFileSync("output/stats.txt", print(), "utf-8");
