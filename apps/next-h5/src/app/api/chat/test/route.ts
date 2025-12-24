import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.GEMINI_API_KEY;
  const MODEL_NAME = 'gemini-3-flash-preview';
  
  if (!API_KEY) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'GEMINI_API_KEY is not configured' 
    }, { status: 500 });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: 'Hello, are you online? Respond with "ONLINE" if you can hear me.' }]
    }]
  };

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json({ 
        status: 'error', 
        httpStatus: resp.status,
        details: data 
      }, { status: resp.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return NextResponse.json({
      status: 'success',
      model: MODEL_NAME,
      response: text,
      raw: data
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
