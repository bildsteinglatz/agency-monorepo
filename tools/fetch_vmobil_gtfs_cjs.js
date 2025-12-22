#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const DATA_DIR = path.resolve(process.cwd(), 'data', 'vmobil');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(cur); cur = ''; } else { cur += ch; }
    }
    values.push(cur);
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (values[idx] || '').trim(); });
    rows.push(obj);
  }
  return rows;
}

(async () => {
  try {
    const gtfsUrl = process.env.VMOBIL_GTFS_URL || 'https://data.opentransportdata.swiss/en/dataset/timetable-2025-gtfs2020/permalink';
    console.log('Downloading', gtfsUrl);
    const res = await fetch(gtfsUrl);
    if (!res.ok) throw new Error('download failed ' + res.status);
    const buffer = Buffer.from(await res.arrayBuffer());
    const zipPath = path.join(DATA_DIR, 'gtfs.zip');
    fs.writeFileSync(zipPath, buffer);
    const zip = new AdmZip(zipPath);
    const entry = zip.getEntry('stops.txt') || zip.getEntry('stops/stops.txt') || zip.getEntries().find(e => e.entryName.endsWith('/stops.txt'));
    if (!entry) throw new Error('stops.txt not found');
    const content = entry.getData().toString('utf8');
    const stops = parseCSV(content).map(r => ({
      stop_id: r.stop_id,
      stop_name: r.stop_name,
      stop_lat: parseFloat(r.stop_lat),
      stop_lon: parseFloat(r.stop_lon),
    }));
    const outPath = path.join(DATA_DIR, 'stops.json');
    fs.writeFileSync(outPath, JSON.stringify(stops, null, 2));
    console.log('Wrote', stops.length, 'stops to', outPath);

    // extract stop_times
    const stEntry = zip.getEntry('stop_times.txt') || zip.getEntry('stop_times/stop_times.txt') || zip.getEntries().find(e => e.entryName.endsWith('/stop_times.txt'));
    if (stEntry) {
      const stContent = stEntry.getData().toString('utf8');
      const rows = parseCSV(stContent).map(r => ({ trip_id: r.trip_id, arrival_time: r.arrival_time, departure_time: r.departure_time, stop_id: r.stop_id, stop_sequence: Number(r.stop_sequence) }));
      const departuresByStop = {};
      for (const r of rows) {
        const parts = r.departure_time.split(':').map(Number);
        const secs = (parts[0]||0)*3600 + (parts[1]||0)*60 + (parts[2]||0);
        if (!departuresByStop[r.stop_id]) departuresByStop[r.stop_id] = [];
        departuresByStop[r.stop_id].push({ trip_id: r.trip_id, departure_time: r.departure_time, departure_secs: secs, seq: r.stop_sequence });
      }
      const out2 = path.join(DATA_DIR, 'stop_times_by_stop.json');
      fs.writeFileSync(out2, JSON.stringify(departuresByStop, null, 2));
      console.log('Wrote stop_times for', Object.keys(departuresByStop).length, 'stops to', out2);
    } else {
      console.warn('stop_times.txt not found in zip');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
