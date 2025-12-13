import * as Vibrant from 'node-vibrant'
import fetch from 'node-fetch'
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

async function getHexFromVibrant(imgUrl) {
  try {
  const palette = await Vibrant.from(imgUrl).getPalette()
    const prefer = ['Vibrant', 'Muted', 'LightVibrant', 'DarkVibrant', 'DarkMuted']
    for (const k of prefer) {
      const sw = palette[k]
      if (!sw) continue
      // sw may have .hex or .getHex()
      if (sw.hex) return sw.hex
      if (typeof sw.getHex === 'function') return sw.getHex()
      if (sw.getHex) return sw.getHex
    }
    // Fallback: try to pick first available swatch
    for (const key of Object.keys(palette)) {
      const s = palette[key]
      if (!s) continue
      if (s.hex) return s.hex
      if (typeof s.getHex === 'function') return s.getHex()
    }
  } catch (err) {
    console.error('Vibrant failed for', imgUrl, err && err.message)
  }
  return null
}

async function fetchArtworksMissingHue(limit = 200) {
  const q = `*[_type=='artwork' && defined(mainImageWithColor.image.asset->url) && !defined(mainImageWithColor.dominantHue)][0...${limit}]` +
    `{"_id": _id, "imageUrl": mainImageWithColor.image.asset->url}`
  return client.fetch(q)
}

async function processOne(doc) {
  const { _id, imageUrl } = doc
  if (!imageUrl) {
    console.warn('no image url for', _id); return
  }
  const hex = await getHexFromVibrant(imageUrl)
  if (!hex) { console.warn('no hex for', _id); return }
  // convert hex to rgb
  const rgb = hex.replace('#','')
  const r = parseInt(rgb.substring(0,2),16)
  const g = parseInt(rgb.substring(2,4),16)
  const b = parseInt(rgb.substring(4,6),16)
  const [h] = rgbToHsl(r,g,b)
  console.log('patching', _id, hex, h)
  await client.patch(_id).set({ 'mainImageWithColor.dominantColor': hex, 'mainImageWithColor.dominantHue': h }).commit()
}

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { concurrency: 1, dryRun: false, limit: 500 }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--concurrency' || a === '-c') { opts.concurrency = Math.max(1, Number(args[++i] || 1)) }
    else if (a === '--dry-run' || a === '-d') { opts.dryRun = true }
    else if (a === '--limit' || a === '-l') { opts.limit = Number(args[++i] || 500) }
  }
  return opts
}

async function main() {
  const opts = parseArgs()
  if (!process.env.SANITY_API_TOKEN && !opts.dryRun) {
    console.error('Please set SANITY_API_TOKEN in the environment to allow document patches.')
    process.exit(1)
  }
  const items = await fetchArtworksMissingHue(opts.limit)
  console.log('found', items.length, 'limit', opts.limit, 'concurrency', opts.concurrency, 'dryRun', opts.dryRun)

  // simple promise pool
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      const it = items[idx]
      try {
        if (opts.dryRun) {
          console.log('[dry] would process', it._id, it.imageUrl)
        } else {
          await processOne(it)
        }
      } catch (err) {
        console.error('failed', it._id, err)
      }
    }
  }

  const workers = []
  for (let w = 0; w < opts.concurrency; w++) workers.push(worker())
  await Promise.all(workers)
  console.log('done')
}

if (require.main === module) main()
