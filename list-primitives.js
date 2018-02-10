
const R = require('ramda');
const fs = require('fs');
require('dot-into').install();

const U = require('./src/utilities');

const allNodes = R.curry((network, char) => _allNodes(network, [])(char));
const _allNodes = (network, stack) => char =>
	R.contains(char, stack) ? []
	: network[char].decomposition.length === 0 ? [char]
	: network[char].decomposition.map(_allNodes(network, R.append(char, stack)))
		.into(R.flatten)
		.into(R.prepend(char))
		.into(R.uniq);
const depth = R.curry((network, char) => _depth(network, [])(char));
const _depth = (network, stack) => char =>
	R.contains(char, stack) ? 0
	: !R.has(char, network) || network[char].decomposition.length === 0 ? 0
	: network[char].decomposition.map(_depth(network, R.append(char, stack))).reduce(R.max, 0) + 1;



const data = require('./src/selection');
const network = require('./src/network');

data.characters
.map(allNodes(network))
.into(R.flatten)
.into(R.uniq)
.into(R.indexBy(R.identity))
.into(R.map(depth(network)))
.into(R.filter(R.equals(0)))
.into(R.keys)
.into(R.join(''))
.into(U.log);

