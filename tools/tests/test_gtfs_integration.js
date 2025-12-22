#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(process.cwd(), 'apps', 'next-h5', 'data', 'vmobil');
const stopsPath = path.join(DATA_DIR, 'stops.json');
const stopTimesPath = path.join(DATA_DIR, 'stop_times_near_halle5.json');

if (!fs.existsSync(stopsPath)) throw new Error('stops.json missing');
if (!fs.existsSync(stopTimesPath)) throw new Error('stop_times_near_halle5.json missing');

const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf8'));
const stopTimes = JSON.parse(fs.readFileSync(stopTimesPath, 'utf8'));

assert.ok(Array.isArray(stops), 'stops should be array');
assert.ok(stops.length > 100000, 'expected >100k stops');
assert.ok(Object.keys(stopTimes).length > 0, 'expected some nearby stop_times');

const firstKey = Object.keys(stopTimes)[0];
const sample = stopTimes[firstKey][0];
assert.ok(typeof sample.trip_id === 'string');
assert.ok(typeof sample.departure_time === 'string');
assert.ok(typeof sample.departure_secs === 'number');

console.log('GTFS integration tests passed');