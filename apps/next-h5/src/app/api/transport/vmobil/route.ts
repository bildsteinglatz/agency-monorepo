import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { origin, destination, travelMode } = body;

  if (!origin || !destination) {
    return NextResponse.json({ error: 'origin and destination required' }, { status: 400 });
  }

  // If we have a GTFS feed URL configured, we could query it here in the future.
  const gtfsUrl = process.env.VMOBIL_GTFS_URL || null;

  // For prototype: proxy to Google's Directions API server-side when transit is requested
  const serverKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!serverKey) {
    return NextResponse.json({ error: 'missing Google Maps API key on server' }, { status: 500 });
  }

  // Build Google Directions request (server-side)
  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', origin);
  url.searchParams.set('destination', destination);
  url.searchParams.set('mode', travelMode || 'transit');
  // departure_time=now helps transit schedules
  if ((travelMode || 'transit').toUpperCase() === 'TRANSIT') {
    url.searchParams.set('departure_time', 'now');
  }
  url.searchParams.set('key', serverKey);

  try {
    const res = await fetch(url.toString());
    const data = await res.json();

    // Simple response wrapper - includes Google response for now
    return NextResponse.json({
      source: 'google-proxy',
      vmobilAvailable: !!gtfsUrl,
      google: data,
    });
  } catch (err) {
    console.error('vmobil proxy error', err);
    return NextResponse.json({ error: 'proxy failed' }, { status: 500 });
  }
}
