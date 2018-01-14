
const R = require('ramda');
const fs = require('fs');
const wanakana = require('wanakana');
const xre = require('xregexp');
require('dot-into').install();


// const toEntry = o =>
// 	({
// 		// studyOrder:    o['order'],
// 		// traditional:   o['character'],
// 		// simplified:    R.has('kSimplifiedVariant', o) ? unicodeToChar(o['kSimplifiedVariant']) : '',
// 		// pinyin:        o['kMandarin'],
// 		// heisigKeyword: o['heisigKeyword'],
// 		// meaning:       o['kDefinition'],
// 		// japaneseKun:   R.has('kJapaneseKun', o) ? wanakana.toHiragana(o['kJapaneseKun']) : '',
// 		// japaneseOn:    R.has('kJapaneseOn', o) ? wanakana.toKatakana(o['kJapaneseOn']) : '',
// 		// soundFile:     '[sound:agj-pinyin-' + pinyinToFile(o['kMandarin']) + '.mp3]',
// 		// frequencyRank: o['frequency'],
// 	});

const notEmptyLine = R.pipe(
	R.trim,
	line => line.length > 0 && line[0] !== '#' && !/^\/\*/.test(line)
);
const unicodeToChar = code => String.fromCodePoint(parseInt(code.substring(2), 16));
const getFile = filename =>
	fs.readFileSync(filename, 'utf-8')
	.split('\n')
	.filter(notEmptyLine);
const getUnihanFile = filename =>
	getFile(filename)
	.map(R.split('\t'))
	.reduce((obj, [code, key, value]) => {
		const char = unicodeToChar(code);
		if (!R.has(char, obj)) obj[char] = {};
		obj[char][key] = value;
		return obj;
	}, {});
const getTocflFile = level =>
	getFile(`data/tocfl/vocabulary-${ level }.txt`)
	.map(R.replace(xre('\\P{Han}', 'ug'), ''))
	.map(R.split(''))
	.into(R.flatten)
	.into(R.uniq);
const patchEntry = R.curry((patches, entry) => R.has(entry.traditional, patches) ? R.merge(entry, patches[entry.traditional]) : entry);


const studyOrder =
	getFile('data/DNWorderT.txt')
	.map(R.split(','))
	.into(R.fromPairs)
	.into(R.map(order => ({ studyOrder: parseInt(order) })));
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
	getFile('data/frequency.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, freq, ..._], index) => {
		obj[char] = { frequencyRank: index + 1, frequencyRaw: parseInt(freq) };
		return obj;
	}, {});
const heisig =
	getFile('data/heisig-traditional.txt')
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
const patches =
	getFile('data/meaning-patches.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, meaning]) => {
		obj[char] = { meaning };
		return obj;
	}, {});


module.exports = {
	characters: R.keys(studyOrder),
	studyOrder,
	readings,
	variants,
	frequencies,
	heisig,
	tocfl,
	expand: chars =>
		chars
		.into(R.indexBy(R.identity))
		.into(R.map(char => R.mergeAll([
				{ traditional: char },
				studyOrder[char],
				readings[char],
				frequencies[char],
				variants[char],
				heisig[char],
			])))
		.into(R.map(patchEntry(patches))),
};

