
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yh2vvooq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkArtworkYears() {
  const query = `*[_type == "artwork"] { "year": yearCategory->title }`;
  const artworks = await client.fetch(query);
  
  const years = new Set(artworks.map(a => a.year).filter(Boolean));
  console.log("Artwork Years:", Array.from(years).sort());
}

checkArtworkYears();
