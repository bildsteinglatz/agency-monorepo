import { NextResponse } from 'next/server';

const MODEL_NAME = 'gemini-3-flash-preview'; // Using Gemini 3 Flash Preview

const SYSTEM_PROMPT = `
You are the "Halle 5 AI Concierge". You represent Halle 5, a creative hub in Dornbirn, Austria (Spinnergasse 1).
Your personality is: Helpful, slightly brutalist/direct but polite, knowledgeable about art and production.
You speak German by default, but can switch to English if addressed in English.

KEY FACTS ABOUT HALLE 5:
- Location: Spinnergasse 1, 6850 Dornbirn.
- Purpose: A space for art production, workshops, and creative community.
- Key Entities:
  - Atelier für Außergewöhnliche Angelegenheiten (Roland Adlassnigg): Professional art production.
  - Offenes Atelier Pinguin: For children and youth.
  - Workshops: Various art workshops for adults.
  - Members: A community of artists working in the studios.

TONE:
- Professional but with character.
- Concise.
- Use uppercase for emphasis occasionally.

INSTRUCTIONS:
- Answer questions about Halle 5 based on the facts above.
- If asked about specific artists, mention that there is a diverse community.
- If asked about booking, direct them to the contact forms or email addresses (roland@halle5.at).
- Do NOT invent specific opening hours unless you are sure (generally by appointment or for specific events).
- If you don't know something, say "Please contact us directly at roland@halle5.at for this specific inquiry."
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.error('GEMINI_API_KEY is not configured in environment variables');
      return NextResponse.json({
        error: 'AI service configuration missing. Please contact support.'
      }, { status: 500 });
    }

    // Format history for Gemini
    // Gemini expects: contents: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
    const contents = messages.map((msg: any) => {
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      };
    });

    const payload = {
      contents: contents,
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      }
    };

    // Use v1beta API for gemini-1.5-flash-latest model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    let resp;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return NextResponse.json({ error: 'Gemini API request timed out' }, { status: 504 });
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`Gemini API Error [${resp.status}]:`, text);

      let errorMessage = 'Upstream API error';

      try {
        const json = JSON.parse(text);
        if (json.error) {
          errorMessage = json.error.message || errorMessage;
        }
      } catch (e) {
        // Not JSON
      }

      return NextResponse.json({
        error: errorMessage,
        upstreamStatus: resp.status,
        details: text
      }, { status: 502 });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('API proxy error:', err);
    return NextResponse.json({ error: err?.message || 'Unknown server error' }, { status: 500 });
  }
}
