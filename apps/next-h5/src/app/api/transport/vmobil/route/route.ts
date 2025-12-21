import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(process.cwd(), 'apps', 'next-h5', 'data', 'vmobil');

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const sinDlat = Math.sin(dLat/2);
  const sinDlon = Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon), Math.sqrt(1 - (sinDlat*sinDlat + Math.cos(lat1)*Math.cos(lat2)*sinDlon*sinDlon)));
  return R * c; // meters
}

function timeToSeconds(t: string) {
  const parts = t.split(':').map(Number);
  return (parts[0]||0)*3600 + (parts[1]||0)*60 + (parts[2]||0);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const originCoords = body.originCoords;
  const destinationCoords = body.destinationCoords;

  if (!originCoords || !destinationCoords) {
    return NextResponse.json({ ok: false, error: 'originCoords and destinationCoords required' }, { status: 400 });
  }

  const stopsPath = path.join(DATA_DIR, 'stops.json');
  const stopTimesPath = path.join(DATA_DIR, 'stop_times_by_stop.json');
  const stopTimesNearPath = path.join(DATA_DIR, 'stop_times_near_halle5.json');
  if (!fs.existsSync(stopsPath) || (!fs.existsSync(stopTimesPath) && !fs.existsSync(stopTimesNearPath))) {
    return NextResponse.json({ ok: false, error: 'Missing GTFS data. Run /api/transport/vmobil/refresh and extract stop times' }, { status: 404 });
  }

  const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf8')) as any[];
  let stopTimes: Record<string, any[]> = {};
  if (fs.existsSync(stopTimesPath)) stopTimes = JSON.parse(fs.readFileSync(stopTimesPath, 'utf8'));
  else if (fs.existsSync(stopTimesNearPath)) stopTimes = JSON.parse(fs.readFileSync(stopTimesNearPath, 'utf8'));

  // find nearest stops
  const origin = { lat: originCoords.lat, lng: originCoords.lng };
  const destination = { lat: destinationCoords.lat, lng: destinationCoords.lng };

  const nearestOrigin = stops.map(s => ({ ...s, dist: haversineKm(origin, { lat: s.stop_lat, lng: s.stop_lon }) })).filter(s => s.dist < 2000).sort((a,b)=>a.dist-b.dist).slice(0,8);
  const nearestDest = stops.map(s => ({ ...s, dist: haversineKm(destination, { lat: s.stop_lat, lng: s.stop_lon }) })).filter(s => s.dist < 2000).sort((a,b)=>a.dist-b.dist).slice(0,8);

  const now = new Date();
  const nowSecs = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();

  const options: any[] = [];

  // Build helper maps for quick lookup: trip -> stops and stop -> trips
  const tripStops: Record<string, Array<{stop_id:string, departure_secs:number, seq:number, departure_time?:string}>> = {};
  const stopTrips: Record<string, Array<{trip_id:string, departure_secs:number, seq:number}>> = {};
  for (const [stopId, times] of Object.entries(stopTimes)) {
    for (const t of times) {
      if (!tripStops[t.trip_id]) tripStops[t.trip_id] = [];
      tripStops[t.trip_id].push({ stop_id: stopId, departure_secs: t.departure_secs, seq: t.seq ?? 0, departure_time: t.departure_time });
      if (!stopTrips[stopId]) stopTrips[stopId] = [];
      stopTrips[stopId].push({ trip_id: t.trip_id, departure_secs: t.departure_secs, seq: t.seq ?? 0 });
    }
  }

  // For each origin stop, look for trips that also serve any destination stop later in sequence
  const MAX_ORIGIN_LOOK = 8;
  const TRANSFER_BUFFER = 30; // seconds

  for (const o of nearestOrigin.slice(0, MAX_ORIGIN_LOOK)) {
    const oTimes = stopTimes[o.stop_id] || [];
    // consider next departures
    const oNext = oTimes.filter(t => t.departure_secs >= nowSecs).sort((a,b)=>a.departure_secs-b.departure_secs).slice(0,20);
    for (const ot of oNext) {
      const tripId = ot.trip_id;
      // check destination stops for same trip id (direct)
      for (const d of nearestDest) {
        const dTimes = stopTimes[d.stop_id] || [];
        const dt = dTimes.find(t => t.trip_id === tripId && (t.seq ?? 0) > (ot.seq ?? 0));
        if (dt) {
          options.push({
            mode: 'direct',
            origin_stop_id: o.stop_id,
            origin_stop_name: o.stop_name,
            origin_stop_lat: o.stop_lat,
            origin_stop_lon: o.stop_lon,
            dest_stop_id: d.stop_id,
            dest_stop_name: d.stop_name,
            dest_stop_lat: d.stop_lat,
            dest_stop_lon: d.stop_lon,
            departure_time: ot.departure_time,
            arrival_time: dt.departure_time,
            departure_secs: ot.departure_secs,
            arrival_secs: dt.departure_secs,
            trip_id: tripId,
            distance_m: Math.round(o.dist + d.dist),
          });
        }
      }

      // one-transfer heuristic: look for a transfer stop on tripId after origin, then another trip that reaches dest
      const stopsOnTrip = (tripStops[tripId] || []).filter(s => s.seq > (ot.seq ?? 0));
      for (const transfer of stopsOnTrip) {
        const arrivalAtTransfer = transfer.departure_secs;
        const transferStop = transfer.stop_id;
        // candidate connecting trips departing from transferStop after arrival+buffer
        const candidates = (stopTrips[transferStop] || []).filter(ct => ct.departure_secs >= arrivalAtTransfer + TRANSFER_BUFFER).sort((a,b)=>a.departure_secs-b.departure_secs).slice(0,12);
        for (const cand of candidates) {
          const candTripStops = tripStops[cand.trip_id] || [];
          // check if this connecting trip reaches any destination stop later in sequence
          for (const d of nearestDest) {
            const dStop = candTripStops.find(s => s.stop_id === d.stop_id && s.seq > (cand.seq ?? 0));
            if (dStop) {
              options.push({
                mode: 'one-transfer',
                origin_stop_id: o.stop_id,
                origin_stop_name: o.stop_name,
                origin_stop_lat: o.stop_lat,
                origin_stop_lon: o.stop_lon,
                transfer_stop_id: transferStop,
                transfer_stop_name: (stops.find(s => s.stop_id === transferStop) || {}).stop_name,
                dest_stop_id: d.stop_id,
                dest_stop_name: d.stop_name,
                dest_stop_lat: d.stop_lat,
                dest_stop_lon: d.stop_lon,
                departure_time: ot.departure_time,
                arrival_time: dStop.departure_time,
                departure_secs: ot.departure_secs,
                arrival_secs: dStop.departure_secs,
                first_trip_id: tripId,
                second_trip_id: cand.trip_id,
                distance_m: Math.round(o.dist + d.dist),
              });
            }
          }
        }
      }
    }
  }

  options.sort((a,b)=>a.departure_secs - b.departure_secs);
  const limited = options.slice(0,10);

  return NextResponse.json({ ok: true, source: 'gtfs', options: limited, originNearest: nearestOrigin.slice(0,5), destNearest: nearestDest.slice(0,5) });
}
