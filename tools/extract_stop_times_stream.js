#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

const DATA_DIR = path.resolve(process.cwd(), 'apps', 'next-h5', 'data', 'vmobil');
const zipPath = path.join(DATA_DIR, 'gtfs.zip');
if (!fs.existsSync(zipPath)) { console.error('gtfs.zip missing; run fetch script first'); process.exit(1); }

// Read stops to find nearby ones we care about (e.g., Halle5 and Bahnhof)
const stops = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stops.json'), 'utf8'));

// Find stops within 1km of Halle5 coordinates
const HALLE5 = { lat: 47.4059666, lng: 9.7444522 };
function haversine(a,b){const R=6371000;const dLat=(b.lat-a.lat)*Math.PI/180;const dLon=(b.lng-a.lng)*Math.PI/180;const lat1=a.lat*Math.PI/180;const lat2=b.lat*Math.PI/180;const sinDlat=Math.sin(dLat/2);const sinDlon=Math.sin(dLon/2);const c=2*Math.atan2(Math.sqrt(sinDlat*sinDlat+Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon),Math.sqrt(1-(sinDlat*sinDlat+Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon)));return R*c}

const nearby = new Set(stops.filter(s=>haversine(HALLE5,{lat:s.stop_lat,lng:s.stop_lon})<=2000).map(s=>s.stop_id));
console.log('Nearby stops count', nearby.size);

(async ()=>{
  const stream = fs.createReadStream(zipPath).pipe(unzipper.Parse({forceStream: true}));
  for await (const entry of stream) {
    const fileName = entry.path;
    if (fileName.endsWith('stop_times.txt')) {
      console.log('Parsing stop_times.txt stream');
      const out = {};
      let remainder = '';

      const { splitCsvLine } = require('./lib/csv');

      for await (const chunk of entry) {
        const text = remainder + chunk.toString('utf8');
        const lines = text.split(/\r?\n/);
        remainder = lines.pop();
        for (const line of lines) {
          // robust CSV split handling quoted fields
          if (!line) continue;
          if (line.startsWith('trip_id')) continue; // header
          const parts = splitCsvLine(line);
          let stop_id = (parts[3] || '').replace(/^\"|\"$/g, '').trim();
          // normalize stop_id by removing any colon suffixes (e.g., 8503054:0:1 -> 8503054)
          const normalizedStopId = stop_id.split(':')[0];
          if (nearby.has(normalizedStopId)) {
            let departure_time = (parts[2] || '').replace(/^\"|\"$/g, '').trim();
            const trip_id = (parts[0] || '').replace(/^\"|\"$/g, '').trim();
            const seqRaw = (parts[4] || '').trim();
            const seqParsed = parseInt(seqRaw, 10);
            const seq = Number.isFinite(seqParsed) ? seqParsed : 0;
            const partsTime = departure_time.split(':').map(Number);
            const departure_secs = (partsTime[0]||0)*3600 + (partsTime[1]||0)*60 + (partsTime[2]||0);
            if (!out[normalizedStopId]) out[normalizedStopId]=[];
            out[normalizedStopId].push({trip_id, departure_time, departure_secs, seq});
          }
        }
      }
      // handle remainder
      if (remainder) {
        const line = remainder;
        if (!line.startsWith('trip_id')) {
          const parts = line.split(',');
          let stop_id = (parts[3] || '').replace(/^"|"$/g, '').trim();
          const normalizedStopId = stop_id.split(':')[0];
          if (nearby.has(normalizedStopId)) {
            let departure_time = (parts[2] || '').replace(/^"|"$/g, '').trim();
            const trip_id = (parts[0] || '').replace(/^"|"$/g, '').trim();
            const seqRaw = (parts[4] || '').trim();
            const seqParsed = parseInt(seqRaw, 10);
            const seq = Number.isFinite(seqParsed) ? seqParsed : 0;
            const partsTime = departure_time.split(':').map(Number);
            const departure_secs = (partsTime[0]||0)*3600 + (partsTime[1]||0)*60 + (partsTime[2]||0);
            if (!out[normalizedStopId]) out[normalizedStopId]=[];
            out[normalizedStopId].push({trip_id, departure_time, departure_secs, seq});
          }
        }
      }
      const outPath = path.join(DATA_DIR, 'stop_times_near_halle5.json');
      fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
      console.log('wrote near stop_times to', outPath);
      entry.autodrain();
    } else {
      entry.autodrain();
    }
  }
})();
