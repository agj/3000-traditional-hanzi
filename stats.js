
const R = require('ramda');
const fs = require('fs');
require('dot-into').install();

const U = require('./src/utilities');

const { out, print } = (() => {
	let output = '';
	return {
		out: (...msg) => output = output + msg.join(' ') + '\n',
		print: () => output,
	}
})();


const data = require('./src/selection');

out("Heisig:", data.heisigCharacters.length);
out("TOCFL:", data.tocflCharacters.length);
out("Heisig + TOCFL:", data.heisigCharacters.concat(data.tocflCharacters).into(R.uniq).length);
out("Heisig + TOCFL + 2000 most frequent:", data.htfCharacters.length);
out("H+T+F components:", data.htfComponents.length);
out('');
out("All H+T+F components sorted:");
out(data.components.join(''));
out('');
out("All H+T+F characters sorted (no components):");
out(data.characters.join(''));

// U.log(print());
fs.writeFileSync('output/stats.txt', print(), 'utf-8');


