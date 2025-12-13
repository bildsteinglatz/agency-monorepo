'use client'
import { useEffect } from 'react'

export default function TriggerHueExtraction({ ids }: { ids: string[] }) {
  useEffect(() => {
    if (!ids || ids.length === 0) return
    // fire-and-forget POST to our server API to compute & patch dominant colors
    ;(async () => {
      try {
        await fetch('/api/dominant-color', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        })
      } catch (e) {
        // swallow errors; background task
        console.error('TriggerHueExtraction failed', e)
      }
    })()
  }, [ids])

  return null
}
