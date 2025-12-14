import React, { useEffect, useState, useCallback } from 'react';
import { PatchEvent, set, useClient } from 'sanity';

// Props follow Sanity custom input contract
export default function DominantColorExtractor(props: any) {
  const { value, onChange, readOnly, schemaType } = props;
  const client = useClient({ apiVersion: '2021-10-21' });

  const [loading, setLoading] = useState(false);
  const imageRef = value?.image?._ref || value?.image?.asset?._ref;

  const fetchImageUrl = useCallback(async () => {
    if (!imageRef) return null;
    try {
      // Dynamically require the image-url builder to avoid types issues
      // @ts-ignore
      const imageUrlBuilder = require('@sanity/image-url');
      // @ts-ignore
      const builder = imageUrlBuilder(client);
      const url = builder.image({ _ref: imageRef }).width(800).url();
      return url;
    } catch (err) {
      return null;
    }
  }, [client, imageRef]);

  const extractAndSet = useCallback(async () => {
    if (readOnly) return;
    const url = await fetchImageUrl();
    if (!url) return;
    setLoading(true);
    try {
      // Dynamically require node-vibrant
      // @ts-ignore
      const Vibrant = require('node-vibrant');
      const palette = await Vibrant.from(url).getPalette();
      const swatch = palette.Vibrant || palette.Muted || palette.DarkVibrant || palette.LightVibrant;
      if (!swatch) return;
      // @ts-ignore
      const rgb = swatch.getRgb();
      // @ts-ignore
      const hex = swatch.getHex();
      const [r, g, b] = rgb.map((n: number) => Math.round(n));
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0;
      if (max !== min) {
        switch (max) {
          case r: h = (60 * ((g - b) / (max - min)) + 360) % 360; break;
          case g: h = (60 * ((b - r) / (max - min)) + 120) % 360; break;
          case b: h = (60 * ((r - g) / (max - min)) + 240) % 360; break;
        }
      }

      // classify color into the requested rainbow categories and order index
      const classify = (r: number, g: number, b: number) => {
        // normalize to 0..1
        const rn = r / 255, gn = g / 255, bn = b / 255;
        const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
        const lum = 0.2126 * rn + 0.7152 * gn + 0.0722 * bn; // relative luminance

        // white / light grey / dark grey / black thresholds
        if (lum > 0.92) return { cat: 'white', order: 0 };
        if (lum > 0.78) return { cat: 'light-grey', order: 1 };
        if (lum < 0.06) return { cat: 'black', order: 10 };
        if (lum < 0.18) return { cat: 'dark-grey', order: 9 };

        // hue-based decisions fallback
        const hue = Math.round(h);
        // map hue ranges into: yellow(2), green(3), blue(4), violet(5), magenta(6), red(7), brown(8)
        if (hue >= 40 && hue < 70) return { cat: 'yellow', order: 2 };
        if (hue >= 70 && hue < 170) return { cat: 'green', order: 3 };
        if (hue >= 170 && hue < 260) return { cat: 'blue', order: 4 };
        if (hue >= 260 && hue < 295) return { cat: 'violet', order: 5 };
        if (hue >= 295 && hue < 330) return { cat: 'magenta', order: 6 };
        if (hue >= 330 || hue < 15) return { cat: 'red', order: 7 };
        // brown is low-saturation, mid-hue around orange/brown
        const sat = (max - min) / (1 - Math.abs(2 * ((rn + gn + bn) / 3) - 1));
        if (hue >= 15 && hue < 40 && sat < 0.6) return { cat: 'brown', order: 8 };

        // fallback
        return { cat: 'other', order: 11 };
      };

      const classification = classify(r, g, b);

      onChange(PatchEvent.from([
        set(hex, ['dominantColor']),
        set(Math.round(h), ['dominantHue']),
        set(classification.cat, ['dominantCategory']),
        set(classification.order, ['dominantOrder']),
      ]));
    } catch (err) {
      // noop
    } finally {
      setLoading(false);
    }
  }, [fetchImageUrl, onChange, readOnly]);

  useEffect(() => {
    // re-run when imageRef changes
    if (!imageRef) return;
    extractAndSet();
  }, [imageRef, extractAndSet]);

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{schemaType.title}</label>
      {schemaType.description && <div style={{ marginBottom: 8, color: '#666' }}>{schemaType.description}</div>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ minWidth: 48, minHeight: 48, borderRadius: 6, background: value?.dominantColor || '#eee', border: '1px solid #ddd' }} />
        <div>
          <div style={{ fontSize: 13 }}>{value?.dominantColor || '—'}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{loading ? 'Extracting color…' : 'Dominant color extracted automatically'}</div>
        </div>
      </div>
    </div>
  );
}
