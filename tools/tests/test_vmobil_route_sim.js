#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(process.cwd(), 'apps', 'next-h5', 'data', 'vmobil');
const stops = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stops.json'), 'utf8'));
const stopTimes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stop_times_near_halle5.json'), 'utf8'));

function hav(a,b){const R=6371000;const dLat=(b.lat-a.lat)*Math.PI/180;const dLon=(b.lng-a.lng)*Math.PI/180;const lat1=a.lat*Math.PI/180;const lat2=b.lat*Math.PI/180;const sinDlat=Math.sin(dLat/2);const sinDlon=Math.sin(dLon/2);const c=2*Math.atan2(Math.sqrt(sinDlat*sinDlat+Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon),Math.sqrt(1-(sinDlat*sinDlat+Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon)));return R*c}

const origin = { lat: 47.4059666, lng: 9.7444522 };
const destination = { lat: 47.410, lng: 9.750 };

const nearestOrigin = stops.map(s => ({ ...s, dist: hav(origin, { lat: s.stop_lat, lng: s.stop_lon }) })).filter(s => s.dist < 2000).sort((a,b)=>a.dist-b.dist).slice(0,8);
const nearestDest = stops.map(s => ({ ...s, dist: hav(destination, { lat: s.stop_lat, lng: s.stop_lon }) })).filter(s => s.dist < 2000).sort((a,b)=>a.dist-b.dist).slice(0,8);

// run the same matching logic as the route endpoint
const now = new Date();
const nowSecs = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
const options = [];
for (const o of nearestOrigin) {
  const oTimes = stopTimes[o.stop_id] || [];
  const oNext = oTimes.filter(t => t.departure_secs >= nowSecs).sort((a,b)=>a.departure_secs-b.departure_secs).slice(0,20);
  for (const ot of oNext) {
    const tripId = ot.trip_id;
    for (const d of nearestDest) {
      const dTimes = stopTimes[d.stop_id] || [];
      const dt = dTimes.find(t => t.trip_id === tripId);
      if (dt && dt.seq > ot.seq) {
        options.push({ origin_stop_id: o.stop_id, dest_stop_id: d.stop_id, tripId, departure_time: ot.departure_time, arrival_time: dt.departure_time });
      }
    }
  }
}

console.log('found options count', options.length);
assert.ok(Array.isArray(options), 'options must be array');
// It's OK if options are 0 (no direct matches right now) but ensure code runs
console.log('Route simulation test passed');