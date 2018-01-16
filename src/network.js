
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
const getIdsFile = (filename, preprocess) =>
	getFile(filename)
	.map(R.split('\t'))
	.map(preprocess)
	.reduce((obj, [char, dec]) => {
		const decomposition = dec.into(stripNonHan).split('').filter(c => c !== char);
		if (R.has(char, obj)) obj[char].decomposition.concat(decomposition).into(R.uniq);
		obj[char] = {
			character: char,
			decomposition: decomposition.into(R.uniq),
		};
		return obj;
	}, {});


const ids = getIdsFile('data/ids.txt', ([_, char, ...decs]) => [char, decs.reduce(R.concat, '')]);
const wrongAnalysisCats = ['簡体', '或字'];
const idsAnalysis = getIdsFile('data/ids-analysis.txt', ([_, char, dec, cat]) => [char, R.contains(cat, wrongAnalysisCats) ? '' : dec]);

const network =
	R.mergeWith((a, b) => ({ character: a.character,
	                         decomposition: R.concat(a.decomposition, b.decomposition).into(R.uniq) }),
	            ids, idsAnalysis)
	.into(R.map(c => ({ character: c.character,
	                    decomposition: c.decomposition.filter(c => R.has(c, ids) || R.has(c, idsAnalysis)) })));

	// .into(chars => chars.into(R.map(char => {
	// 	char.decomposition = char.decomposition.reduce((r, comp) => {
	// 		if (comp !== char.character && R.has(comp, chars)) r.push(chars[comp]);
	// 		return r;
	// 	}, []);
	// 	return char;
	// })));


module.exports = network;