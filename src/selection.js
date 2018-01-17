
const R = require('ramda');


const U = require('./utilities');
const log = U.log;
const allNodes = R.curry((network, char) => _allNodes(network, [])(char));
const _allNodes = (network, stack) => char =>
	R.contains(char, stack) ? []
	: network[char].decomposition.length === 0 ? [char]
	: network[char].decomposition.map(_allNodes(network, R.append(char, stack)))
		.into(R.flatten)
		.into(R.prepend(char))
		.into(R.uniq);
const foundIn = R.flip(R.contains);
const componentOf = R.curry((network, a, b) => R.contains(a, allNodes(network, network[b])));
const depth = R.curry((network, char) => _depth(network, [])(char));
const _depth = (network, stack) => char =>
	R.contains(char, stack) ? 0
	: !R.has(char, network) || network[char].decomposition.length === 0 ? 0
	: network[char].decomposition.map(_depth(network, R.append(char, stack))).reduce(R.max, 0) + 1;
const sortByDepth = depths => R.sort((a, b) => depths[a] < depths[b] ? -1 : depths[a] > depths[b] ? 1 : 0);
const sortByFrequency = frequencies => R.sort((a, b) =>
	!R.has(a, frequencies) && !R.has(b, frequencies) ? 0
	: !R.has(a, frequencies) ? 1 : !R.has(b, frequencies) ? -1
	: frequencies[a] < frequencies[b] ? -1 : 1);


const data = require('./data');
const network = require('./network');
const frequenciesRaw = data.frequencies;
const heisig = data.heisig;
const tocfl = data.tocfl;
const conflateMap = data.conflateMap;


const heisigCharacters =
	heisig
	.into(R.reject(R.propEq('heisigIndex', 'c')))
	.into(R.keys);
const heisigComponents =
	heisig
	.into(R.filter(R.propEq('heisigIndex', 'c')))
	.into(R.keys);
const tocflCharacters = tocfl.all;
const frequencies =
	frequenciesRaw
	.into(R.map(R.prop('frequencyRank')));
const frequentCharacters =
	frequencies
	.into(R.filter(R.gte(2000)))
	.into(R.keys);

const conflate = R.curry((conflateMap, chars) => chars.map(char => R.has(char, conflateMap) ? conflateMap[char] : char).into(R.uniq));
const htfCharacters =
	heisigCharacters.concat(tocflCharacters).concat(frequentCharacters)
	.into(R.uniq)
	.into(conflate(conflateMap));
const htfComponentsRaw =
	htfCharacters
	.map(allNodes(network))
	.into(R.flatten)
	.concat(heisigComponents)
	.into(R.uniq)
	.into(conflate(conflateMap))
	.into(R.without(htfCharacters));
const htfComponentUseRaw =
	htfCharacters.concat(htfComponentsRaw)
	.map(char => network[char].decomposition)
	.into(R.flatten);
const htfComponentUse =
	htfComponentsRaw
	.map(char => [char, htfComponentUseRaw.reduce((n, c) => c === char ? n + 1 : n, 0)])
	.into(R.fromPairs);
const htfComponents =
	htfComponentUse
	.into(R.reject(R.gte(1)))
	.into(R.keys);

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
		allNodes(network, char)
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

const charactersResult =
	charactersAndComponentsSorted
	.into(R.indexBy(R.identity))
	.into(R.map(c => ({
		studyOrder: charactersAndComponentsSorted.indexOf(c) + 1,
		isComponent: foundIn(componentsSorted, c),
	})));


module.exports = {
	characters: charactersSorted,
	components: componentsSorted,
	charactersAndComponents: charactersAndComponentsSorted,

	characterData: charactersResult,

	heisigCharacters,
	heisigComponents,
	tocflCharacters,
	htfCharacters,
	htfComponents,
};

