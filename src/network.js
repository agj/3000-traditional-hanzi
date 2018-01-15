
const R = require('ramda');
const fs = require('fs');
const xre = require('xregexp');
require('dot-into').install();

const log = R.tap(console.log);
const getFile = filename =>
	fs.readFileSync(filename, 'utf-8')
	.split('\n')
	.filter(notEmptyLine);
const notEmptyLine = R.pipe(
	R.trim,
	line => line.length > 0 && line[0] !== '#' && !/^\/\*/.test(line)
);
const stripNonHan = R.replace(xre('\\P{Han}', 'gA'), '');


const network =
	getFile('data/ids.txt')
	.map(R.split('\t'))
	.reduce((obj, [_, char, dec]) => {
		obj[char] = {
			character: char,
			decomposition: dec.into(stripNonHan).split('').into(R.uniq),
		};
		return obj;
	}, {})
	.into(chars => chars.into(R.map(char => {
		char.decomposition = char.decomposition.reduce((r, comp) => {
			if (comp !== char.character && R.has(comp, chars)) r.push(chars[comp]);
			return r;
		}, []);
		return char;
	})));
	// .into(chars => {
	// 	chars.forEach(char => {
	// 		char.level = getLevel(char);
	// 	})
	// 	return chars;
	// });
// const getLevel = char => char.decomposition.length === 0 ? 0 : 1 + getLevel();

// R.values(network)
// // .filter(c => c.decomposition.length === 0)
// .filter(c => c.decomposition.some(d => d.character === '門'))
// .map(R.prop('character'))
// .join('')
// .into(log);


module.exports = network;