#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(process.cwd(), 'apps', 'next-h5', 'data', 'vmobil');
const stops = path.join(DATA_DIR, 'stops.json');
const stopTimesNear = path.join(DATA_DIR, 'stop_times_near_halle5.json');

if (!fs.existsSync(stops)) { console.error('stops.json missing'); process.exit(2); }
if (!fs.existsSync(stopTimesNear)) { console.error('stop_times_near_halle5.json missing'); process.exit(2); }

const s = JSON.parse(fs.readFileSync(stops,'utf8'));
const st = JSON.parse(fs.readFileSync(stopTimesNear,'utf8'));
console.log('stops:', s.length);
console.log('nearby stop_times entries:', Object.keys(st).length);
console.log('example departure for first stop:', st[Object.keys(st)[0]][0]);
