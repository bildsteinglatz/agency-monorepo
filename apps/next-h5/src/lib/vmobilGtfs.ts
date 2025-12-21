import fs from 'fs';
import path from 'path';
// @ts-ignore
import AdmZip from 'adm-zip';

const DATA_DIR = path.resolve(process.cwd(), 'data', 'vmobil');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function parseCSV(content: string) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const rows = [] as any[];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [] as string[];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        values.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur);

    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (values[idx] || '').trim(); });
    rows.push(obj);
  }
  return rows;
}

export async function saveGtfsZip(buffer: Buffer) {
  const zipPath = path.join(DATA_DIR, 'gtfs.zip');
  fs.writeFileSync(zipPath, buffer);
  return zipPath;
}

export function extractStopsFromZip(zipPath: string) {
  const zip = new AdmZip(zipPath);
  const entry = zip.getEntry('stops.txt') || zip.getEntry('stops/stops.txt') || zip.getEntries().find((e: any) => e.entryName.endsWith('/stops.txt'));
  if (!entry) throw new Error('stops.txt not found in GTFS zip');
  const content = entry.getData().toString('utf8');
  const stops = parseCSV(content).map((r: any) => ({
    stop_id: r.stop_id,
    stop_code: r.stop_code,
    stop_name: r.stop_name,
    stop_lat: parseFloat(r.stop_lat),
    stop_lon: parseFloat(r.stop_lon),
    zone_id: r.zone_id || null,
  }));
  const outPath = path.join(DATA_DIR, 'stops.json');
  fs.writeFileSync(outPath, JSON.stringify(stops, null, 2));
  return { stopsCount: stops.length, outPath };
}

function timeToSeconds(t: string) {
  // GTFS times can be >24:00 for overnight trips. Handle HH:MM:SS
  const parts = t.split(':').map(Number);
  return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
}

export function extractStopTimesFromZip(zipPath: string) {
  const zip = new AdmZip(zipPath);
  const entry = zip.getEntry('stop_times.txt') || zip.getEntry('stop_times/stop_times.txt') || zip.getEntries().find((e: any) => e.entryName.endsWith('/stop_times.txt'));
  if (!entry) throw new Error('stop_times.txt not found in GTFS zip');
  const content = entry.getData().toString('utf8');
  const rows = parseCSV(content).map((r: any) => ({
    trip_id: r.trip_id,
    arrival_time: r.arrival_time,
    departure_time: r.departure_time,
    stop_id: r.stop_id,
    stop_sequence: Number(r.stop_sequence),
  }));

  // Build per-stop departures (keep limited fields)
  const departuresByStop: Record<string, any[]> = {};
  for (const r of rows) {
    const secs = timeToSeconds(r.departure_time);
    if (!departuresByStop[r.stop_id]) departuresByStop[r.stop_id] = [];
    departuresByStop[r.stop_id].push({ trip_id: r.trip_id, departure_time: r.departure_time, departure_secs: secs, seq: r.stop_sequence });
  }

  // Save trimmed JSON
  const outPath = path.join(DATA_DIR, 'stop_times_by_stop.json');
  fs.writeFileSync(outPath, JSON.stringify(departuresByStop, null, 2));
  return { stopsWithDepartures: Object.keys(departuresByStop).length, outPath };
}

export async function downloadAndExtract(gtfsUrl: string) {
  const res = await fetch(gtfsUrl);
  if (!res.ok) throw new Error('Failed to download GTFS: ' + res.statusText);
  const buffer = Buffer.from(await res.arrayBuffer());
  const zipPath = await saveGtfsZip(buffer);
  const extractResult = extractStopsFromZip(zipPath);
  // Also extract stop_times
  try {
    const st = extractStopTimesFromZip(zipPath);
    return { ...extractResult, stopTimes: st };
  } catch (e) {
    return extractResult;
  }
}

export function loadStops() {
  const outPath = path.join(DATA_DIR, 'stops.json');
  if (!fs.existsSync(outPath)) return null;
  return JSON.parse(fs.readFileSync(outPath, 'utf8'));
}
