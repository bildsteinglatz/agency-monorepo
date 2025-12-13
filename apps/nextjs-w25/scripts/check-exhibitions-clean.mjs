
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yh2vvooq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkExhibitions() {
  const query = `*[_type == "exhibition"] | order(year desc) [0...5] {
    title,
    year,
    venue
  }`;
  const exhibitions = await client.fetch(query);
  console.log(JSON.stringify(exhibitions, null, 2));
}

checkExhibitions();
