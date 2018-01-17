
const R = require('ramda');

const patchEntry = R.curry((patches, entry) => R.has(entry.traditional, patches) ? R.merge(entry, patches[entry.traditional]) : entry);


const selection = require('./selection');
const data = require('./data');
const selectionData = require('./selection').characterData;

const compileData = char =>
	R.mergeAll([
		{ traditional: char },
		selectionData[char],
		data.readings[char],
		data.frequencies[char],
		data.variants[char],
		data.heisig[char],
		data.conflated[char],
	]);

const expand = chars =>
	chars
	.into(R.indexBy(R.identity))
	.into(R.map(compileData))
	.into(R.map(o => o.conflated ? R.mergeAll(o.conflated.map(compileData).into(R.append(o))) : o))
	.into(R.map(patchEntry(data.patches)));


module.exports = expand(selection.characters);

