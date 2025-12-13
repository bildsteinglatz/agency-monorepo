import { NextResponse } from 'next/server'
// Use the node-specific entry to ensure Turbopack/Next can import Vibrant on the server
import { Vibrant } from 'node-vibrant/node'
import { createClient } from 'next-sanity'
import crypto from 'crypto'

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function hexToRgb(hex: string) {
  const h = hex.replace('#','')
  return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)]
}

function rgbToHsl(r:number,g:number,b:number){
  r/=255;g/=255;b/=255
  const max=Math.max(r,g,b),min=Math.min(r,g,b)
  let h=0,s=0,l=(max+min)/2
  if(max!==min){
    const d=max-min
    s=l>0.5?d/(2-max-min):d/(max+min)
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break}
    h/=6
  }
  return Math.round(h*360)
}

export async function POST(req: Request) {
  try {
    // Read raw body for signature verification and JSON parsing
    const rawBody = await req.text()
    let body: any
    try { body = JSON.parse(rawBody) } catch (e) { body = {} }

    // If SANITY_WEBHOOK_SECRET is configured, verify HMAC-SHA256 signature
    const secret = process.env.SANITY_WEBHOOK_SECRET
    if (secret) {
      // Sanity may send different header names; support a few common variants
      const headerNames = ['sanity-signature', 'sanity-webhook-signature', 'x-sanity-signature', 'x-signature', 'webhook-signature']
      let sigHeader: string | null = null
      for (const hn of headerNames) {
        const v = req.headers.get(hn)
        if (v) { sigHeader = v; break }
      }
      if (!sigHeader) {
        return NextResponse.json({ ok:false, message: 'missing webhook signature' }, { status: 401 })
      }

      // header may include a prefix like 'sha256=' — strip if present
      const received = sigHeader.replace(/^sha256=/i, '')
      const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      // constant-time compare
      const a = Buffer.from(hmac, 'hex')
      let b: Buffer
      try { b = Buffer.from(received, 'hex') } catch (e) { return NextResponse.json({ ok:false, message: 'invalid signature format' }, { status: 401 }) }
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return NextResponse.json({ ok:false, message: 'signature mismatch' }, { status: 401 })
      }
    }
  // support: { id } or { ids: [..] } or sanity webhook body which may contain documentId
    const ids: string[] = []
    if (body.id) ids.push(body.id)
    if (body.ids && Array.isArray(body.ids)) ids.push(...body.ids)
    if (body.documentId) ids.push(body.documentId)
    if (body.documents && Array.isArray(body.documents)) ids.push(...body.documents.map((d: any) => d._id || d.documentId).filter(Boolean))
    if (ids.length === 0) return NextResponse.json({ ok:false, message: 'no id(s) provided' }, { status:400 })

    const results = []
    for (const id of ids) {
      try {
        const q = `*[_id == $id]{ _id, "imageUrl": mainImageWithColor.image.asset->url }[0]`
        const doc = await client.fetch(q, { id })
        if (!doc || !doc.imageUrl) { results.push({ id, ok:false, reason: 'no image' }); continue }
  const palette = await Vibrant.from(doc.imageUrl).getPalette()
        const sw = palette.Vibrant || Object.values(palette).find(Boolean)
        if (!sw) { results.push({ id, ok:false, reason: 'no swatch' }); continue }
  // Swatch typing may not include getHex in this build; use a safe fallback
  const hex = (sw as any)?.hex || (typeof (sw as any)?.getHex === 'function' ? (sw as any).getHex() : null)
        if (!hex) { results.push({ id, ok:false, reason: 'no hex' }); continue }
        const [r,g,b] = hexToRgb(hex)
        const hue = rgbToHsl(r,g,b)
        await client.patch(id).set({ 'mainImageWithColor.dominantColor': hex, 'mainImageWithColor.dominantHue': hue }).commit()
        results.push({ id, ok:true, hex, hue })
      } catch (err:any) {
        results.push({ id, ok:false, error: String(err) })
      }
    }
    return NextResponse.json({ ok:true, results })
  } catch (err:any) {
    return NextResponse.json({ ok:false, error: String(err) }, { status:500 })
  }
}
