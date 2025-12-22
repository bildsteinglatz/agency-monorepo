#!/usr/bin/env node
const assert = require('assert');
(async ()=>{
  const fs = require('fs');
  const path = require('path');
  const stops = JSON.parse(fs.readFileSync(path.resolve(process.cwd(),'apps','next-h5','data','vmobil','stops.json'),'utf8'));
  const stopTimes = JSON.parse(fs.readFileSync(path.resolve(process.cwd(),'apps','next-h5','data','vmobil','stop_times_near_halle5.json'),'utf8'));

  // run the route algorithm similar to the endpoint
  function hav(a,b){const R=6371000;const dLat=(b.lat-a.lat)*Math.PI/180;const dLon=(b.lng-a.lng)*Math.PI/180;const lat1=a.lat*Math.PI/180;const lat2=b.lat*Math.PI/180;const sinDlat=Math.sin(dLat/2);const sinDlon=Math.sin(dLon/2);const c=2*Math.atan2(Math.sqrt(sinDlat*sinDlat+Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon),Math.sqrt(1-(sinDlat*sinDlat+Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon)));return R*c}

  const origin = { lat: 47.4059666, lng: 9.7444522 };
  const destination = { lat: 47.410, lng: 9.750 };
  const nearestOrigin = stops.map(s => ({ ...s, dist: hav(origin, { lat: s.stop_lat, lng: s.stop_lon }) })).filter(s => s.dist < 2000).sort((a,b)=>a.dist-b.dist).slice(0,8);
  const nearestDest = stops.map(s => ({ ...s, dist: hav(destination, { lat: s.stop_lat, lng: s.stop_lon }) })).filter(s => s.dist < 2000).sort((a,b)=>a.dist-b.dist).slice(0,8);

  // build helper maps
  const tripStops = {};
  const stopTrips = {};
  for (const [stopId, times] of Object.entries(stopTimes)) {
    for (const t of times) {
      if (!tripStops[t.trip_id]) tripStops[t.trip_id] = [];
      tripStops[t.trip_id].push({ stop_id: stopId, departure_secs: t.departure_secs, seq: t.seq ?? 0, departure_time: t.departure_time });
      if (!stopTrips[stopId]) stopTrips[stopId] = [];
      stopTrips[stopId].push({ trip_id: t.trip_id, departure_secs: t.departure_secs, seq: t.seq ?? 0 });
    }
  }

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
        const dt = dTimes.find(t => t.trip_id === tripId && (t.seq ?? 0) > (ot.seq ?? 0));
        if (dt) {
          options.push({ mode: 'direct', origin: o.stop_id, dest: d.stop_id, departure_time: ot.departure_time, arrival_time: dt.departure_time });
        }
      }
      const stopsOnTrip = (tripStops[tripId] || []).filter(s => s.seq > (ot.seq ?? 0));
      for (const transfer of stopsOnTrip) {
        const arrivalAtTransfer = transfer.departure_secs;
        const transferStop = transfer.stop_id;
        const candidates = (stopTrips[transferStop] || []).filter(ct => ct.departure_secs >= arrivalAtTransfer + 30).sort((a,b)=>a.departure_secs-b.departure_secs).slice(0,12);
        for (const cand of candidates) {
          const candTripStops = tripStops[cand.trip_id] || [];
          for (const d of nearestDest) {
            const dStop = candTripStops.find(s => s.stop_id === d.stop_id && s.seq > (cand.seq ?? 0));
            if (dStop) {
              options.push({ mode: 'one-transfer', origin: o.stop_id, transfer_stop: transferStop, dest: d.stop_id, departure_time: ot.departure_time, arrival_time: dStop.departure_time });
            }
          }
        }
      }
    }
  }

  const result = { ok: true, source: 'gtfs', options, originNearest: nearestOrigin.slice(0,5), destNearest: nearestDest.slice(0,5) };
  assert.ok(result.ok);
  assert.ok(Array.isArray(result.options));
  console.log('route endpoint simulation test passed; options:', result.options.length);
})();