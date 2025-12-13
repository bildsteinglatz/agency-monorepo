import { createClient } from 'next-sanity';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yh2vvooq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkTimelineTexts() {
  try {
    const query = `*[_type == "timelineText"]`;
    const texts = await client.fetch(query);
    console.log('Timeline Texts found:', texts.length);
    console.log(JSON.stringify(texts, null, 2));
  } catch (error) {
    console.error('Error fetching timeline texts:', error);
  }
}

checkTimelineTexts();
