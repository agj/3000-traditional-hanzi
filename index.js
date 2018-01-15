
const R = require('ramda');
const fs = require('fs');
const pinyin = require('pinyin-utils');
require('dot-into').install();

const U = require('./src/utilities');
const toStringEntry = o => [
		o.studyOrder,
		o.traditional,
		o.simplified,
		o.pinyin,
		o.heisigKeyword,
		o.meaning,
		o.japaneseKun,
		o.japaneseOn,
		'[sound:agj-pinyin-' + pinyinToFile(o.pinyin) + '.mp3]',
		o.frequencyRank
	].join('\t');
const pinyinToFile = py => {
	let r =
		pinyin.markToNumber(py)
		.match(/^(\S+)/)[1]
		.replace(/ü/g, 'uu');
	if (/\D$/.test(r)) r = r + '1';
	return r;
};


const data = require('./src/data');
const characters =
	R.keys(data.studyOrder)
	.filter(char => R.has(char, data.readings) && R.has('pinyin', data.readings[char]) && (R.has(char, data.frequencies) && data.frequencies[char].frequencyRank <= 3000));

data.expand(characters)
.into(R.map(toStringEntry))
.into(R.values)
.into(r => {
	fs.writeFileSync('output/out.txt', r.join('\n'), 'utf-8');
});

