import { NextResponse } from 'next/server';
import { loadStops } from '@/lib/vmobilGtfs';

export async function GET() {
  const stops = loadStops();
  if (!stops) return NextResponse.json({ ok: false, error: 'No stops loaded; run /api/transport/vmobil/refresh first' }, { status: 404 });
  return NextResponse.json({ ok: true, count: stops.length, stops });
}
