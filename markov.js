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
            this.model[state]["totalCount"] = 0
            this.expectedModel[state] = {}
            this.expectedModel[state]["totalCount"] = 0
            for (const innerState of this.states) {
                this.model[state][innerState] = {
                    count: 0,
                    probability: 0.0
                };
                this.expectedModel[state][innerState] = {
                    count: 0,
                    probability: 0.0
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
        this.model[parent].totalCount = this.model[parent].totalCount + 1;
        this.model[parent][child].count = this.model[parent][child].count + 1;
    }

    updateExpectedNode(parent, child) {
        this.expectedModel[parent].totalCount = this.expectedModel[parent].totalCount + 1;
        this.expectedModel[parent][child].count = this.expectedModel[parent][child].count + 1;
    }

    refreshProbabilities() {
        for (const state of this.states) {
            let charTotal = this.model[state].totalCount;
            for (const childState of this.states) {
                let childCharTotal = this.model[state][childState].count
                if (childCharTotal !== 0) {
                    this.model[state][childState].probability = childCharTotal / charTotal;
                }
            }
        }

        for (const state of this.states) {
            let expectedCharTotal = this.expectedModel[state].totalCount;
            for (const childState of this.states) {
                let expectedChildCharTotal = this.expectedModel[state][childState].count
                if (expectedChildCharTotal !== 0) {
                    this.expectedModel[state][childState].probability = expectedChildCharTotal / expectedCharTotal;
                }
            }
        }
    }

    getFocusSet() {
        let userMatrix = this.modelToMatrix(this.model);
        let expectedMatrix = this.modelToMatrix(this.expectedModel);
        let error = this.calculateError(userMatrix, expectedMatrix);
        return this.calculateFocusSet(error);
    }

    calculateFocusSet(error) {
        let errorList = error._data;
        let foundErrors = [];
        for (let parentChar = 0; parentChar < 26; parentChar++) {
            for (let childChar = 0; childChar < 26; childChar++) {
                if (this.expectedModel[this.states[parentChar]][this.states[childChar]].count > 0) { // TODO: set this to 5
                    foundErrors.push({
                        parentChar: this.states[parentChar],
                        childChar: this.states[childChar],
                        error: errorList[parentChar][childChar]
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
                transitionLine.push(firstChar[childState].probability);
            }
            transitions.push(transitionLine);
        }
        return math.matrix(transitions);
    }


    calculateError(userMatrix, expectedMatrix) {
        // let a = math.multiply(userMatrix, 100);
        // let b = math.multiply(expectedMatrix, 100);
        let a = userMatrix;
        let b = expectedMatrix;
        let sub = math.subtract(b, a);
        // let divided = math.dotDivide(sub, a);
        let divided = this.divide(sub._data, b._data);
        // console.log(divided)
        // console.log(divided);
        // let multiplied = math.dotMultiply(divided, 100);
        return divided;
    }

    divide(a,b) {
        let result = [];
        for (let i in a) {
            let tmp = []
            for (let x in a[i]) {
                if (a[i][x] !== 0) {
                    console.log("divide")
                    console.log("parent "+  this.states[i] + " child " + this.states[x]);
                    console.log(a[i][x])
                    console.log(a[i][x] / b[i][x])
                    console.log(b[i][x])
                }
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