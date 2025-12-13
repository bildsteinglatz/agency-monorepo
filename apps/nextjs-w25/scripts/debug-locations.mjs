
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function listLocations() {
  const query = `*[_type == "exhibition"] {
    title,
    "location": coalesce(venue->city, venue.city),
    "country": coalesce(venue->country, venue.country)
  }`;

  try {
    const exhibitions = await client.fetch(query);
    const locations = new Set(exhibitions.map(ex => ex.location));
    console.log('All locations found in Sanity:', Array.from(locations).sort());
    
    const havana = exhibitions.filter(ex => 
      (ex.location && ex.location.toLowerCase().includes('hav')) || 
      (ex.country && ex.country.toLowerCase().includes('cu'))
    );
    console.log('Exhibitions matching "hav" or "cu":', JSON.stringify(havana, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

listLocations();
