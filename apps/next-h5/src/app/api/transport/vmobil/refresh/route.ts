import { NextResponse } from 'next/server';
import { downloadAndExtract } from '@/lib/vmobilGtfs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const gtfsUrl = body.gtfsUrl || process.env.VMOBIL_GTFS_URL || 'https://data.opentransportdata.swiss/en/dataset/timetable-2025-gtfs2020/permalink';

  try {
    const result = await downloadAndExtract(gtfsUrl);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error('GTFS refresh failed', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
