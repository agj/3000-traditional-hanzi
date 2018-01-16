
const R = require('ramda');
const fs = require('fs');
const pinyin = require('pinyin-utils');
require('dot-into').install();

const U = require('./src/utilities');
const toStringEntry = o => [
		o.traditional,
		o.studyOrder,
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
		py
		.replace(/^(\S+).*$/, '$1')
		.into(pinyin.markToNumber)
		.replace(/ü/g, 'uu');
	if (/\D$/.test(r)) r = r + '1';
	return r;
};


const data = require('./src/data');

data.expand(data.studyOrder.characters)
.into(R.map(toStringEntry))
.into(R.values)
.into(r => {
	fs.writeFileSync('output/facts.tsv', r.join('\n'), 'utf-8');
});

