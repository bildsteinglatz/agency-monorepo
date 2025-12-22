#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

const DATA_DIR = path.resolve(process.cwd(), 'apps', 'next-h5', 'data', 'vmobil');
const zipPath = path.join(DATA_DIR, 'gtfs.zip');
if (!fs.existsSync(zipPath)) { console.error('gtfs.zip missing'); process.exit(1); }

(async ()=>{
  const stream = fs.createReadStream(zipPath).pipe(unzipper.Parse({forceStream: true}));
  for await (const entry of stream) {
    const fileName = entry.path;
    if (fileName.endsWith('stop_times.txt')) {
      console.log('Found', fileName);
      let count=0;
      const ids = new Set();
      for await (const chunk of entry) {
        const s = chunk.toString('utf8');
        const lines = s.split(/\r?\n/);
        for (const line of lines) {
          if (!line) continue;
          if (line.startsWith('trip_id')) continue;
          const parts = line.split(',');
          const stop_id = parts[3];
          ids.add(stop_id);
          count++;
          if (count>10000) break;
        }
        if (count>10000) break;
      }
      console.log('sampled lines', count, 'unique stop_ids sample:', Array.from(ids).slice(0,20));
      entry.autodrain();
      return;
    } else entry.autodrain();
  }
})();