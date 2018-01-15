
const R = require('ramda');
const fs = require('fs');
require('dot-into').install();

const U = require('./src/utilities');
const allNodes = R.curry((network, char) => {
	if (char.decomposition.length === 0) return [char.character];
	return char.decomposition.map(allNodes(network))
		.into(R.flatten)
		.into(R.prepend(char.character))
		.into(R.uniq);
});
const foundIn = R.flip(R.contains);
const componentOf = R.curry((network, a, b) => R.contains(a, allNodes(network, network[b])));
const _depth = a => !a || a.decomposition.length === 0 ? 0 : a.decomposition.map(_depth).reduce(R.max, 0) + 1;
const depth = R.curry((network, a) => _depth(network[a]));
const sortByDepth = depths => R.sort((a, b) => depths[a] < depths[b] ? -1 : depths[a] > depths[b] ? 1 : 0);
const sortByFrequency = frequencies => R.sort((a, b) =>
	!R.has(a, frequencies) && !R.has(b, frequencies) ? 0
	: !R.has(a, frequencies) ? 1 : !R.has(b, frequencies) ? -1
	: frequencies[a] < frequencies[b] ? -1 : 1);

const { out, print } = (() => {
	let output = '';
	return {
		out: msg => output = output + msg + '\n',
		print: () => output,
	}
})();


const data = require('./src/data');
const heisigCharacters =
	data.heisig
	.into(R.reject(R.propEq('heisigIndex', 'c')))
	.into(R.keys);
const heisigComponents =
	data.heisig
	.into(R.filter(R.propEq('heisigIndex', 'c')))
	.into(R.keys);
const tocflCharacters = data.tocfl.all;
const frequencies =
	data.frequencies
	.into(R.map(R.prop('frequencyRank')));
const frequentCharacters =
	frequencies
	.into(R.filter(R.gte(2000)))
	.into(R.keys);

const htfCharacters =
	heisigCharacters.concat(tocflCharacters).concat(frequentCharacters)
	.into(R.uniq);
const network = data.network;
const htfComponentsRaw =
	htfCharacters
	.map(c => network[c])
	.map(allNodes(network))
	.into(R.flatten)
	.concat(heisigComponents)
	.into(R.uniq)
	.into(R.without(htfCharacters));
const htfComponentUseRaw =
	htfCharacters.concat(htfComponentsRaw)
	.map(char => network[char].decomposition.map(R.prop('character')))
	.into(R.flatten);
const htfComponentUse =
	htfComponentsRaw
	.map(char => [char, htfComponentUseRaw.reduce((n, c) => c === char ? n + 1 : n, 0)])
	.into(R.fromPairs);
const htfComponents =
	htfComponentUse
	.into(R.reject(R.gte(1)))
	.into(R.keys);


out("Heisig: " + heisigCharacters.length);
out("TOCFL: " + tocflCharacters.length);
out("Heisig + TOCFL: " + heisigCharacters.concat(tocflCharacters).into(R.uniq).length);
out("Heisig + TOCFL + 2000 most frequent: " + htfCharacters.length);
out("H+T+F components: " + htfComponents.length);


const depths =
	htfCharacters.concat(htfComponents)
	.into(R.indexBy(R.identity))
	.into(R.map(depth(network)));
const charactersAndComponents =
	htfCharacters.concat(htfComponents)
	.into(sortByFrequency(frequencies));
const charactersAndComponentsSorted =
	charactersAndComponents
	.reduce((r, char) =>
		allNodes(network, network[char])
			.filter(foundIn(charactersAndComponents))
			.into(R.without(r))
			.into(sortByDepth(depths))
			.into(R.concat(r)),
		[]);
const charactersSorted =
	charactersAndComponentsSorted
	.filter(foundIn(htfCharacters));
const componentsSorted =
	charactersAndComponentsSorted
	.filter(foundIn(htfComponents));


out('');
out("All H+T+F components sorted:");
out(componentsSorted.join(''));
out('');
out("All H+T+F characters sorted (no components):");
out(charactersSorted.join(''));

fs.writeFileSync('output/stats.txt', print(), 'utf-8');


