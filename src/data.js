
const R = require('ramda');
const fs = require('fs');
const wanakana = require('wanakana');
const xre = require('xregexp');
require('dot-into').install();


const U = require('./utilities');
const unicodeToChar = code => String.fromCodePoint(parseInt(code.substring(2), 16));
const getUnihanFile = filename =>
	U.getFile(filename)
	.map(R.split('\t'))
	.reduce((obj, [code, key, value]) => {
		const char = unicodeToChar(code);
		if (!R.has(char, obj)) obj[char] = {};
		obj[char][key] = value;
		return obj;
	}, {});
const getTocflFile = level =>
	U.getFile(`data/tocfl/vocabulary-${ level }.txt`)
	.map(R.replace(xre('\\P{Han}', 'ug'), ''))
	.map(R.split(''))
	.into(R.flatten)
	.into(R.uniq);
const patchEntry = R.curry((patches, entry) => R.has(entry.traditional, patches) ? R.merge(entry, patches[entry.traditional]) : entry);


const readings =
	getUnihanFile('data/unihan/Unihan_Readings.txt')
	.into(R.map(o => ({
		pinyin:      o['kMandarin'],
		japaneseKun: R.has('kJapaneseKun', o) ? wanakana.toHiragana(o['kJapaneseKun']) : '',
		japaneseOn:  R.has('kJapaneseOn', o) ? wanakana.toKatakana(o['kJapaneseOn']) : '',
		meaning:     o['kDefinition'],
	})));
const variants =
	getUnihanFile('data/unihan/Unihan_Variants.txt')
	.into(R.mapObjIndexed((o, char) => ({
		simplified: R.has('kSimplifiedVariant', o) ? unicodeToChar(o['kSimplifiedVariant']) : '',
	})));
const frequencies =
	U.getFile('data/frequency.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, freq, ..._], index) => {
		obj[char] = { frequencyRank: index + 1, frequencyRaw: parseInt(freq) };
		return obj;
	}, {});
const heisig =
	U.getFile('data/heisig-traditional.txt')
	.map(R.split('\t'))
	.reduce((obj, [idx, chr, kwd]) => {
		obj[chr] = { heisigKeyword: kwd, heisigIndex: idx };
		return obj;
	}, {});
const tocfl = [1, 2, 3, 4, 5, 6, 7]
	.reduce((r, level) => {
		r[level] = getTocflFile(level).into(R.without(r.all));
		r.all = r.all.concat(r[level]);
		return r;
	}, { all: [] });
const network = require('./network');
const studyOrder = require('./study-order')(network, frequencies, heisig, tocfl);
	// U.getFile('data/DNWorderT.txt')
	// .map(R.split(','))
	// .into(R.fromPairs)
	// .into(R.map(order => ({ studyOrder: parseInt(order) })));
const patches =
	U.getFile('data/meaning-patches.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, meaning]) => {
		obj[char] = { meaning };
		return obj;
	}, {});


module.exports = {
	studyOrder,
	readings,
	variants,
	frequencies,
	heisig,
	tocfl,
	network,
	expand: chars =>
		chars
		.into(R.indexBy(R.identity))
		.into(R.map(char => R.mergeAll([
				{ traditional: char },
				studyOrder.charactersAndComponents[char],
				readings[char],
				frequencies[char],
				variants[char],
				heisig[char],
			])))
		.into(R.map(patchEntry(patches))),
};

