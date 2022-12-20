// index.js
'use strict';

var Markov = require('./markov.js');

var markov = new Markov();

markov.train("zz zy zz zy ab ac ab", "zz zz zz zz ab ab ab")
let focusSet = markov.getFocusSet();

console.log(focusSet)