
const R = require('ramda');
const pinyin = require('pinyin-utils');
const zhuyin = require('zhuyin');
const cedict = require('cedict-lookup').loadTraditional('data/external/cedict_ts.u8');

const U = require('./utilities');

const zhuyinDiacritics = ['ˊ', 'ˇ', '`', '˙'];

const patchEntry = R.curry((patches, entry) => R.has(entry.traditional, patches) ? R.merge(entry, patches[entry.traditional]) : entry);


const selection = require('./selection');
const data = require('./data');
const selectionData = require('./selection').characterData;

const getVocabulary = char =>
	data.tocflWords
	.into(R.omit(['all']))
	.into(R.values)
	.map(R.filter(w => w.replace(char, '') !== w))
	.into(R.flatten)
	.into(R.filter(w => w.length > 1 && cedict.getMatch(w).length > 0))
	.into(R.take(3))
	.map(w => {
		const pys =
			cedict.getMatch(w)[0].pinyin
			.split(' ')
			.map(R.replace(/u:/g, 'ü'))
			.map(pinyin.numberToMark);
		const zys =
			pys.map(zhuyin.fromPinyinSyllable)
			.map(zy => zhuyinDiacritics.includes(R.last(zy)) ? zy : zy + ' ');
		return {
			word: w,
			pinyin: pys.join(''),
			zhuyin: zys.join(''),
		};
	});

const compileData = char =>
	R.mergeAll([
		{ traditional: char },
		selectionData[char],
		data.readings[char],
		data.cangjie[char],
		data.frequencies[char],
		data.variants[char],
		data.heisig[char],
		data.conflated[char],
		{ vocabulary: getVocabulary(char) },
	]);

const expand = chars =>
	chars
	.into(R.indexBy(R.identity))
	.into(R.map(compileData))
	.into(R.map(o => o.conflated
		? o.conflated
		  .map(compileData)
		  .into(R.append(o))
		  .into(R.mergeAll)
		: o))
	.into(R.map(patchEntry(data.patches)));


module.exports = expand(selection.characters);

