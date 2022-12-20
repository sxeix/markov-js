'use strict';

const math = require('mathjs');

module.exports = class Markov {

    constructor() {
        this.model = {};
        this.expectedModel = {};
        this.states =['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        this.init();
    }
 
    init() {
        for (const state of this.states) {
            this.model[state] = {}
            this.model[state]["tc"] = 0
            this.expectedModel[state] = {}
            this.expectedModel[state]["tc"] = 0
            for (const innerState of this.states) {
                this.model[state][innerState] = {
                    c: 0, // count
                    p: 0.0 // probability
                };
                this.expectedModel[state][innerState] = {
                    c: 0, // count
                    p: 0.0 // probability
                };
            }
        }
    }

    train(wordset, expectedWordset) {
        let words = this.sanitiseInputString(wordset);
        let expectedWords = this.sanitiseInputString(expectedWordset);

        for (let x = 0; x < words.length; x++) {
            let word = words[x];
            for (let i = 0; i < word.length - 1; i++) {
                this.updateNode(word[i], word[i+1])
            }
        }

        for (let x = 0; x < expectedWords.length; x++) {
            let expectedWord = expectedWords[x];
            for (let i = 0; i < expectedWord.length - 1; i++) {
                this.updateExpectedNode(expectedWord[i], expectedWord[i+1])
            }
        }

        this.refreshProbabilities();
    }

    updateNode(parent, child) {
        this.model[parent].tc = this.model[parent].tc + 1; // totalCount
        this.model[parent][child].c = this.model[parent][child].c + 1;
    }

    updateExpectedNode(parent, child) {
        this.expectedModel[parent].tc = this.expectedModel[parent].tc + 1; // totalCount
        this.expectedModel[parent][child].c = this.expectedModel[parent][child].c + 1;
    }

    refreshProbabilities() {
        for (const state of this.states) {
            let charTotal = this.model[state].tc;
            for (const childState of this.states) {
                let childCharTotal = this.model[state][childState].c
                if (childCharTotal !== 0) {
                    this.model[state][childState].p = childCharTotal / charTotal;
                }
            }
        }

        for (const state of this.states) {
            let expectedCharTotal = this.expectedModel[state].tc;
            for (const childState of this.states) {
                let expectedChildCharTotal = this.expectedModel[state][childState].c
                if (expectedChildCharTotal !== 0) {
                    this.expectedModel[state][childState].p = expectedChildCharTotal / expectedCharTotal;
                }
            }
        }
    }

    getFocusSet() {
        let userMatrix = this.modelToMatrix(this.model);
        let expectedMatrix = this.modelToMatrix(this.expectedModel);
        let error = this.calculateError(userMatrix, expectedMatrix);
        let focusSets =  this.calculateFocusSet(error);
        let sortedFocusSets = focusSets.sort((a, b) => {
            return (a.e < b.e) ? 1 : (a.e > b.e) ? -1 : 0;
        });
        return sortedFocusSets.length >= 3 ? sortedFocusSets.slice(0,3) : sortedFocusSets;
    }

    calculateFocusSet(error) {
        let errorList = error._data;
        let foundErrors = [];
        for (let parentChar = 0; parentChar < 26; parentChar++) {
            for (let childChar = 0; childChar < 26; childChar++) {
                if (this.expectedModel[this.states[parentChar]][this.states[childChar]].c > 0) { // TODO: set this to 5
                    foundErrors.push({
                        pc: this.states[parentChar],
                        cc: this.states[childChar],
                        e: errorList[parentChar][childChar]
                    })
                }
            }
        }
        return foundErrors;
    }

    modelToMatrix(model) {
        let transitions = [];
        for (const state of this.states) {
            let transitionLine = [];
            let firstChar = model[state];
            for (const childState of this.states) {
                transitionLine.push(firstChar[childState].p);
            }
            transitions.push(transitionLine);
        }
        return math.matrix(transitions);
    }


    calculateError(userMatrix, expectedMatrix) {
        let a = userMatrix;
        let b = expectedMatrix;
        let sub = math.subtract(b, a);
        let divided = this.divide(sub._data, b._data);
        return divided;
    }

    divide(a,b) {
        let result = [];
        for (let i in a) {
            let tmp = []
            for (let x in a[i]) {
                if (b[i][x] === 0) {
                    tmp.push(0);
                    continue;
                }
                tmp.push(a[i][x] / b[i][x])
            }
            result.push(tmp)
        }
        return math.matrix(result);
    }

    sanitiseInputString(wordset) {
        // TODO: make this work properly
        return wordset.split(" ");
    }
    
    displayModel() {
        console.log(this.model);
    }
 }