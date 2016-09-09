require('buba/register')
const assert = require('power-assert')
const es2015 = require('babel-preset-es2015-loose')
const { transformFileSync } = require('babel-core')

const functionalPlugin = require('./index').default

const { code } = transformFileSync('testFile.js', {
  presets: [ es2015 ],
  plugins: [ [functionalPlugin, {
    'name': 'pipe',
    'as': 'pipe',
    'from': 'ramda'
  }]
 ]
})

assert.strictEqual(code, `"use strict";
"use fc";

var _ramda = require("ramda");

var add = function add(x) {
  return function (y) {
    return x + y;
  };
};

var add3 = add(3);

var add0 = add(0);

var add0Then3 = (0, _ramda.pipe)(add0, add3);

var x = add0Then3(1);`)

console.log('Tests pass!')
