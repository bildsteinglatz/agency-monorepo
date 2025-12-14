Dominant Color extractor for Sanity Studio

Files added:
- `schemaTypes/imageWithColor.ts` — an object schema wrapping an `image` plus `dominantColor` and `dominantHue` fields.
- `studio/components/DominantColorExtractor.tsx` — Sanity custom input component that extracts the dominant color using `node-vibrant` and writes `dominantColor` + `dominantHue`.

Installation

1. Install dependencies in your Studio project:

```bash
npm install node-vibrant
# or
pnpm add node-vibrant
```

2. Register the component in your Studio `part` configuration (e.g., in `sanity.config.ts`):

```ts
import DominantColorExtractor from './studio/components/DominantColorExtractor';
// ...
export default defineConfig({
  // ...
  studio: {
    components: {
      // register as a custom input for the imageWithColor type
      "input": [
        {
          name: 'imageWithColor',
          component: DominantColorExtractor,
        }
      ]
    }
  }
});
```

3. Add `schemaTypes/imageWithColor.ts` to your schema imports and use it in documents, e.g.:

```ts
{
  name: 'mainImageWithColor',
  title: 'Main image',
  type: 'imageWithColor'
}
```

Notes & Caveats
- The component uses `node-vibrant` to extract a palette from the image URL. For this to work in Studio, the image must be accessible via a CORS-enabled URL. If your Studio is running locally and your images stay private in the Sanity CDN, prefer using server-side extraction or a serverless function.
- `dominantColor` is written as a hex string (e.g. `#3a7bd5`). `dominantHue` is numeric 0-360 and is useful for ordering by hue.

GROQ example

Fetch artworks with their dominant color and sort by hue:

```groq
*[_type == 'artwork' && defined(mainImageWithColor.dominantHue)] | order(mainImageWithColor.dominantHue asc) {
  _id,
  title,
  "imageUrl": mainImageWithColor.image.asset->url,
  "dominantColor": mainImageWithColor.dominantColor,
  "dominantHue": mainImageWithColor.dominantHue
}
```

Server-side alternative
- If you can't rely on the Studio environment to fetch images from the CDN (CORS/private assets), implement a webhook or server-side migration that downloads the image, runs Vibrant there, and patches the document with `dominantColor` and `dominantHue`.
