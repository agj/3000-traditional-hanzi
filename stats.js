
const R = require('ramda');
const fs = require('fs');
require('dot-into').install();

const log = R.tap(console.log);


const data = require('./src/data');
const heisigCharacters = R.keys(data.heisig);
const tocflCharacters = data.tocfl.all;

log("Heisig characters not in study order list:");

heisigCharacters
.into(R.without(data.characters))
.into(R.join(''))
.into(log);

log('');
log("TOCFL characters not in study order list:");

[1, 2, 3, 4, 5, 6, 7]
.map(R.prop(R.__, data.tocfl))
.map(R.without(data.characters))
.forEach(l => {
	log('---');
	log(l.join(''));
});

// tocflCharacters
// .filter(R.complement(R.contains(R.__, data.characters)))
// .into(R.join(''))
// .into(log);

log('');
log("TOCFL characters not in Heisig list:");

[1, 2, 3, 4, 5, 6, 7]
.map(R.prop(R.__, data.tocfl))
.map(R.without(heisigCharacters))
.forEach(l => {
	log('---');
	log(l.join(''));
});


