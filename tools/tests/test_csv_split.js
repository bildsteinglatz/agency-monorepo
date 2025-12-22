#!/usr/bin/env node
const assert = require('assert');
const { splitCsvLine } = require('../lib/csv');

// basic quoted field
const a = '1,2,"a,b",4';
assert.deepStrictEqual(splitCsvLine(a), ['1','2','a,b','4']);

// escaped quotes inside quoted field
const b = 'x,"quoted ""inner""",y';
assert.deepStrictEqual(splitCsvLine(b), ['x','quoted "inner"','y']);

// numeric stop_id quoted
const c = 'trip1,1,07:00:00,"8503054:0:1",10';
const parts = splitCsvLine(c);
assert.strictEqual(parts[3], '8503054:0:1');

console.log('CSV split tests passed');