'use strict';

var Markov = require('./markov.js');

var markov = new Markov();

markov.train("zz zy zz zy ab ac ab aa aa aa ab ab", "zz zz zz zz ab ab ab aa aa aa aa aa")
let focusSet = markov.getFocusSet();

console.log(focusSet)