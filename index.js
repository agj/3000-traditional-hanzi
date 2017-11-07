

let R = require('ramda');
let fs = require('fs');
require('dot-into').install();
let pinyin = require('pinyin-utils');

let log = R.tap(console.log);
let notEmpty = R.pipe(
	R.trim,
	line => line.length > 0 && line[0] !== '#' && !/^\/\*/.test(line)
);
let getFile = filename =>
	fs.readFileSync(filename, 'utf-8')
	.split('\n')
	.filter(notEmpty);
let getUnihanFile = filename =>
	getFile(filename)
	.map(R.split('\t'))
	.reduce((obj, [code, key, value]) => {
		let char = String.fromCharCode(parseInt(code.replace('U+', '0x')));
		if (!R.has(char, obj)) obj[char] = {};
		obj[char][key] = value;
		return obj;
	}, {});
let pinyinToFile = py => {
	let r =
		pinyin.markToNumber(py)
		.match(/^(\w+)/)[1];
	if (/\D$/.test(r)) r = r + '1';
	return r;
};
let toStringEntry = o =>
	[
		o['order'],
		o['character'],
		o['kMandarin'],
		o['kDefinition'],
		'[sound:pffy-mp3-chinese-pinyin-sound/' + pinyinToFile(o['kMandarin']) + '.mp3]',
		o['frequency'],
	].join('\t');


let characters =
	getFile('data/DNWorderT.txt')
	.map(R.split(','))
	.into(R.fromPairs)
	.into(R.map(order => ({ order: parseInt(order) })));
let frequencies =
	getFile('data/CharFreq.txt')
	.map(R.split('\t'))
	.into(log)
	.reduce((obj, [freq, char, ..._]) => {
		if (!R.has(char, obj)) obj[char] = {};
		obj[char].frequency = parseInt(freq);
		return obj;
	}, {});
let readings = getUnihanFile('data/unihan/Unihan_Readings.txt');
let otherData = getUnihanFile('data/unihan/Unihan_DictionaryLikeData.txt');

log(characters['見']);
log(readings['見']);
log(otherData['見']);
log(frequencies['見']);

let readableCharacters =
	R.keys(characters)
	.filter(char => R.has(char, readings) && R.has('kMandarin', readings[char]) && (R.has(char, frequencies) && frequencies[char].frequency <= 5000));

readableCharacters
.into(R.indexBy(R.identity))
.into(R.map(char => R.mergeAll([ { character: char }, characters[char], readings[char], otherData[char], frequencies[char] ])))
.into(R.map(toStringEntry))
.into(R.values)
.into(r => {
	fs.writeFileSync('output/out.txt', r.join('\n'), 'utf-8');
});



