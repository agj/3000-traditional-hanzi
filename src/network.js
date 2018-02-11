
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
		obj[char] = { character: char,
		              decomposition: stripNonHan(dec).split('').filter(c => c !== char).into(R.uniq) };
		return obj;
	}, {});


const ids = getIdsFile('data/ids.txt', ([_, char, ...decs]) => [char, decs.reduce(R.concat, '')]);
const wrongAnalysisCats = ['簡体', '或字'];
const idsAnalysis = getIdsFile('data/ids-analysis.txt', ([_, char, dec, cat]) => [char, R.contains(cat, wrongAnalysisCats) ? '' : dec]);
const reCjkDecomp = /^(.+):.+\((.+)\)$/u;
const redefineNumeric = R.curry((mapping, component) => /\d+/.test(component) ? mapping[component].decomposition.map(redefineNumeric(mapping)).into(R.flatten).into(R.uniq) : [component]);
const cjkDecomp =
	getFile('data/cjk-decomp.txt')
	.map(l => [l.replace(reCjkDecomp, '$1'), l.replace(reCjkDecomp, '$2').split(',')])
	.reduce((obj, [char, dec]) => {
		obj[char] = { character: char,
		              decomposition: dec };
		return obj;
	}, {})
	.into(all => all.into(R.filter(o => !/\d+/.test(o.character))).into(R.map(o => ({
		character: o.character,
		decomposition: o.decomposition.map(redefineNumeric(all)).into(R.flatten).into(R.uniq),
	}))));

const mergeDecompositions = (a, b) => ({ character: a.character,
                                         decomposition: R.concat(a.decomposition, b.decomposition).into(R.uniq) });
const network =
	R.mergeWith(mergeDecompositions, ids, idsAnalysis)
	.into(R.mergeWith(mergeDecompositions, cjkDecomp))
	.into(R.map(c => ({ character: c.character,
	                    decomposition: c.decomposition.filter(c => R.has(c, ids) || R.has(c, idsAnalysis) || R.has(c, cjkDecomp)) })));


module.exports = network;
