

const R = require('ramda');
const fs = require('fs');
require('dot-into').install();
const pinyin = require('pinyin-utils');
const wanakana = require('wanakana');

const log = R.tap(console.log);
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
const pinyinToFile = py => {
	let r =
		pinyin.markToNumber(py)
		.match(/^(\S+)/)[1]
		.replace(/ü/g, 'uu');
	if (/\D$/.test(r)) r = r + '1';
	return r;
};
const toEntry = o =>
	({
		studyOrder:    o['order'],
		traditional:   o['character'],
		simplified:    R.has('kSimplifiedVariant', o) ? unicodeToChar(o['kSimplifiedVariant']) : '',
		pinyin:        o['kMandarin'],
		heisigKeyword: o['heisigKeyword'],
		meaning:       o['kDefinition'],
		japaneseKun:   R.has('kJapaneseKun', o) ? wanakana.toHiragana(o['kJapaneseKun']) : '',
		japaneseOn:    R.has('kJapaneseOn', o) ? wanakana.toKatakana(o['kJapaneseOn']) : '',
		soundFile:     '[sound:agj-pinyin-' + pinyinToFile(o['kMandarin']) + '.mp3]',
		frequencyRank: o['frequency'],
	});
const patchEntry = R.curry((patches, entry) => R.has(entry.traditional, patches) ? R.merge(entry, patches[entry.traditional]) : entry);
const toStringEntry = o => [o.studyOrder, o.traditional, o.simplified, o.pinyin, o.heisigKeyword, o.meaning, o.japaneseKun, o.japaneseOn, o.soundFile, o.frequencyRank].join('\t');


const characters =
	getFile('data/DNWorderT.txt')
	.map(R.split(','))
	.into(R.fromPairs)
	.into(R.map(order => ({ order: parseInt(order) })));
const readings = getUnihanFile('data/unihan/Unihan_Readings.txt');
const otherData = getUnihanFile('data/unihan/Unihan_DictionaryLikeData.txt');
const frequencies =
	getFile('data/frequency.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, freq, ..._], index) => R.merge(obj, { [char]: { frequency: index + 1,
	                                                                     frequencyRaw: parseInt(freq) } }),
	        {});
const variants = getUnihanFile('data/unihan/Unihan_Variants.txt');
const heisig =
	getFile('data/heisig-keywords.txt')
	.map(R.split('\t'))
	.reduce((obj, [tc, sc, tk, sk]) => R.merge(obj, { [tc]: { heisigKeyword: tk } }), {});
const patches =
	getFile('data/meaning-patches.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, meaning]) => R.merge(obj, { [char]: { meaning } }), {});


const readableCharacters =
	R.keys(characters)
	.filter(char => R.has(char, readings) && R.has('kMandarin', readings[char]) && (R.has(char, frequencies) && frequencies[char].frequency <= 3000));

readableCharacters
.into(R.indexBy(R.identity))
.into(R.map(char => R.mergeAll([ { character: char }, characters[char], readings[char], otherData[char], frequencies[char], variants[char], heisig[char] ])))
.into(R.map(toEntry))
.into(R.map(patchEntry(patches)))
.into(R.map(toStringEntry))
.into(R.values)
.into(r => {
	fs.writeFileSync('output/out.txt', r.join('\n'), 'utf-8');
});



