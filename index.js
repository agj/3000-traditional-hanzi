

let R = require('ramda');
let fs = require('fs');
require('dot-into').install();
let pinyin = require('pinyin-utils');
let wanakana = require('wanakana');

let log = R.tap(console.log);
let notEmpty = R.pipe(
	R.trim,
	line => line.length > 0 && line[0] !== '#' && !/^\/\*/.test(line)
);
let unicodeToChar = code => String.fromCodePoint(parseInt(code.substring(2), 16));
let getFile = filename =>
	fs.readFileSync(filename, 'utf-8')
	.split('\n')
	.filter(notEmpty);
let getUnihanFile = filename =>
	getFile(filename)
	.map(R.split('\t'))
	.reduce((obj, [code, key, value]) => {
		let char = unicodeToChar(code);
		if (!R.has(char, obj)) obj[char] = {};
		obj[char][key] = value;
		return obj;
	}, {});
let pinyinToFile = py => {
	let r =
		pinyin.markToNumber(py)
		.match(/^(\S+)/)[1]
		.replace(/ü/g, 'uu');
	if (/\D$/.test(r)) r = r + '1';
	return r;
};
let toEntry = o =>
	({
		studyOrder:    o['order'],
		traditional:   o['character'],
		simplified:    R.has('kSimplifiedVariant', o) ? unicodeToChar(o['kSimplifiedVariant']) : '',
		pinyin:        o['kMandarin'],
		meaning:       o['kDefinition'],
		japaneseKun:   R.has('kJapaneseKun', o) ? wanakana.toHiragana(o['kJapaneseKun']) : '',
		japaneseOn:    R.has('kJapaneseOn', o) ? wanakana.toKatakana(o['kJapaneseOn']) : '',
		soundFile:     '[sound:pffy-mp3-chinese-pinyin-sound-' + pinyinToFile(o['kMandarin']) + '.mp3]',
		frequencyRank: o['frequency'],
	});
let toStringEntry = o => [o.studyOrder, o.traditional, o.simplified, o.pinyin, o.meaning, o.japaneseKun, o.japaneseOn, o.soundFile, o.frequencyRank].join('\t');


let characters =
	getFile('data/DNWorderT.txt')
	.map(R.split(','))
	.into(R.fromPairs)
	.into(R.map(order => ({ order: parseInt(order) })));
let frequencies =
	getFile('data/frequency.txt')
	.map(R.split('\t'))
	.reduce((obj, [char, freq, ..._], index) => {
		if (!R.has(char, obj)) obj[char] = {};
		obj[char].frequency = index + 1;
		obj[char].frequencyRaw = parseInt(freq);
		return obj;
	}, {});
let readings = getUnihanFile('data/unihan/Unihan_Readings.txt');
let variants = getUnihanFile('data/unihan/Unihan_Variants.txt');
let otherData = getUnihanFile('data/unihan/Unihan_DictionaryLikeData.txt');


let readableCharacters =
	R.keys(characters)
	.filter(char => R.has(char, readings) && R.has('kMandarin', readings[char]) && (R.has(char, frequencies) && frequencies[char].frequency <= 3000));

readableCharacters
.into(R.indexBy(R.identity))
.into(R.map(char => R.mergeAll([ { character: char }, characters[char], readings[char], otherData[char], frequencies[char], variants[char] ])))
.into(R.map(toEntry))
.into(R.map(toStringEntry))
.into(R.values)
.into(r => {
	fs.writeFileSync('output/out.txt', r.join('\n'), 'utf-8');
});



