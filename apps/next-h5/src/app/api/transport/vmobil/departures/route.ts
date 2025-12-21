import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(process.cwd(), 'apps', 'next-h5', 'data', 'vmobil');

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get('lat') || '0');
  const lng = parseFloat(url.searchParams.get('lng') || '0');
  const radius = parseFloat(url.searchParams.get('radius') || '500'); // meters

  const stopsPath = path.join(DATA_DIR, 'stops.json');
  const stopTimesPath = path.join(DATA_DIR, 'stop_times_by_stop.json');
  const stopTimesNearPath = path.join(DATA_DIR, 'stop_times_near_halle5.json');
  if (!fs.existsSync(stopsPath) || (!fs.existsSync(stopTimesPath) && !fs.existsSync(stopTimesNearPath))) {
    return NextResponse.json({ ok: false, error: 'Missing GTFS data. Run /api/transport/vmobil/refresh or extract stop times' }, { status: 404 });
  }

  const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf8')) as any[];
  let stopTimes: Record<string, any[]> = {};
  if (fs.existsSync(stopTimesPath)) stopTimes = JSON.parse(fs.readFileSync(stopTimesPath, 'utf8'));
  else if (fs.existsSync(stopTimesNearPath)) stopTimes = JSON.parse(fs.readFileSync(stopTimesNearPath, 'utf8'));

  // find nearest stops within radius
  function haversine(a: any, b: any) {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const sinDlat = Math.sin(dLat/2);
    const sinDlon = Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon), Math.sqrt(1 - (sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon)));
    return R * c;
  }

  const origin = { lat, lng };
  const nearby = stops.map(s => ({ ...s, dist: haversine(origin, { lat: s.stop_lat, lng: s.stop_lon }) })).filter(s => s.dist <= radius).sort((a,b)=>a.dist-b.dist).slice(0,10);

  const now = new Date();
  const nowSecs = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();

  const departures = nearby.map(s => {
    const times = stopTimes[s.stop_id] || [];
    // return next 5 departures after now
    const next = times.filter((t:any)=>t.departure_secs >= nowSecs).sort((a:any,b:any)=>a.departure_secs-b.departure_secs).slice(0,5);
    return { stop: s, next };
  });

  return NextResponse.json({ ok: true, origin, nearbyCount: nearby.length, departures });
}
