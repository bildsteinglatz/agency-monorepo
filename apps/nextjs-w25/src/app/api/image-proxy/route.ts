import { NextResponse, type NextRequest } from 'next/server';

const ALLOWED_ORIGINS = ['https://cdn.sanity.io'];

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src');
  if (!src) {
    return NextResponse.json({ error: 'Missing src parameter' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(src);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const isAllowed = ALLOWED_ORIGINS.some((origin) => targetUrl.origin === origin);
  if (!isAllowed) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
  }

  const upstream = await fetch(targetUrl, { cache: 'no-store' });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: upstream.status || 502 });
  }

  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('Content-Type') || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('Access-Control-Allow-Origin', '*');

  return new NextResponse(upstream.body, {
    status: 200,
    headers,
  });
}
