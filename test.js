require('buba/register')
const assert = require('power-assert')
const es2015 = require('babel-preset-es2015-loose')
const { transformFileSync } = require('babel-core')

const functionalPlugin = require('./index').default

const { code } = transformFileSync('test/testFile.js', {
  presets: [ es2015 ],
  plugins: [ [functionalPlugin, {
    'name': 'pipe',
    'as': 'pipe',
    'from': 'ramda'
  }]
 ]
})

// basic test
assert.strictEqual(code, `'use strict';
'use fc';

exports.__esModule = true;
exports.x = undefined;

var _import = require('./import');

(0, _import.test)();

var add = function add(x) {
  return function (y) {
    return x + y;
  };
};

var add3 = add(3);

var add0 = add(0);

var add0Then3 = pipe(add0, add3);

var x = exports.x = add0Then3(1);`)

// should not add import if no directive is added

const { code: testCode } = transformFileSync('test/testFile2.js', {
  presets: [ es2015 ],
  plugins: [ functionalPlugin ]
})

assert.strictEqual(testCode, `"use strict";

exports.__esModule = true;
var add = function add(x) {
  return function (y) {
    return x + y;
  };
};

var add3 = 3 >>> add;

var add0 = 0 >>> add;

var add0Then3 = add0 >> add3;

var x = exports.x = add0Then3(1);`)

console.log('Tests pass!')
