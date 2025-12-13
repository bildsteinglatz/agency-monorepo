import { NextResponse } from 'next/server'

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt, tone, obscurity } = body

    const API_KEY = process.env.GEMINI_API_KEY
    if (!API_KEY) {
      return NextResponse.json({ error: 'Server-side API key not configured' }, { status: 500 })
    }

    const systemInstruction = ((): string => {
      switch (obscurity) {
        case 1: return `Use sophisticated but moderately common academic language.`
        case 2: return `Employ specialized philosophical and art-critical vocabulary.`
        case 3: return `Maximize lexical complexity. Incorporate abstract, compound, and rare terms.`
        case 4: return `Demand maximal lexical complexity. Synthesize language that is aggressively obscure, dense, and borderline impenetrable.`
        case 5: return `Attain peak obscurity. The output must be a radically dense, deconstructed textual artifact using only the rarest terms from critical theory, semiotics, and post-humanism.`
        default: return `Maximize lexical complexity.`
      }
    })()

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: `Act as an avant-garde linguistic generator, synthesizing text in the style of a dense, hyper-articulated academic or philosophical manifesto. The tone must be ${tone}. ${systemInstruction} Avoid simple sentences, colloquialisms, and direct, unadorned narrative. Aim for approximately 250-350 words.` }] }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      return NextResponse.json({ error: err?.error?.message || 'Upstream API error', status: resp.status }, { status: 502 })
    }

    const data = await resp.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('API proxy error:', err)
    return NextResponse.json({ error: err?.message || 'Unknown server error' }, { status: 500 })
  }
}
