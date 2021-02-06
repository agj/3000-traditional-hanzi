const R = require('ramda');
const fs = require('fs');


const log = R.tap(console.log);

const notEmptyLine = R.pipe(
	R.trim,
	line => line.length > 0 && line[0] !== '#' && !/^\/\*/.test(line)
);

const getFile = filename =>
	fs.readFileSync(filename, 'utf-8')
	.split('\n')
	.filter(notEmptyLine);

asList = string => string ? string.split(' ') : [];


module.exports = {
	log,
	getFile,
	whenAll: Promise.all.bind(Promise),
};
