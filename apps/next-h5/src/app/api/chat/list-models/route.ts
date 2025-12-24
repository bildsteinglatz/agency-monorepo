import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
