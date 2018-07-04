
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
const removeNonHan = R.replace(xre('\\P{Han}', 'ug'), '');
const getTocflFileWords = level =>
	U.getFile(`data/tocfl/vocabulary-${ level }.txt`)
	.into(R.uniq);
const getTocflFileCharacters = level =>
	U.getFile(`data/tocfl/vocabulary-${ level }.txt`)
	.map(removeNonHan)
	.map(R.split(''))
	.into(R.flatten)
	.into(R.uniq);


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
		simplified: R.has('kSimplifiedVariant', o) ? o['kSimplifiedVariant'].split(' ').map(unicodeToChar).filter(c => c !== char) : [],
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
const tocflWords =
	[1, 2, 3, 4, 5, 6, 7]
	.reduce((r, level) => {
		r[level] = getTocflFileWords(level).into(R.without(r.all));
		r.all = r.all.concat(r[level]);
		return r;
	}, { all: [] });
const tocfl =
	[1, 2, 3, 4, 5, 6, 7]
	.reduce((r, level) => {
		r[level] = getTocflFileCharacters(level).into(R.without(r.all));
		r.all = r.all.concat(r[level]);
		return r;
	}, { all: [] });
const patches =
	U.getFile('data/patches.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, key, value]) => {
		obj[char] = { [key]: JSON.parse(value) };
		return obj;
	}, {});
const conflateMap =
	U.getFile('data/conflate.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, conf]) => {
		obj[char] = conf;
		return obj;
	}, {});
const conflated =
	R.values(conflateMap)
	.into(R.uniq)
	.into(R.indexBy(R.identity))
	.into(R.map(char => ({
		conflated: conflateMap.into(R.filter(R.equals(char))).into(R.keys),
	})));


module.exports = {
	readings,
	variants,
	frequencies,
	heisig,
	tocflWords,
	tocfl,
	patches,
	conflateMap,
	conflated,
};

