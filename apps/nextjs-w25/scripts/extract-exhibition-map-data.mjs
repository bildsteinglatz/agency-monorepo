
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function extractExhibitionMapData() {
  console.log('Fetching exhibitions...');
  
  // Query to get all exhibitions with relevant fields
  const query = `*[_type == "exhibition"] {
    title,
    "institution": coalesce(venue->name, venue.name),
    "location": coalesce(venue->city, venue.city),
    "country": coalesce(venue->country, venue.country),
    year,
    "imageUrl": mainImage.asset->url
  }`;

  try {
    const exhibitions = await client.fetch(query);
    console.log(`Found ${exhibitions.length} exhibitions.`);
    if (exhibitions.length > 0) {
      console.log('First exhibition sample:', JSON.stringify(exhibitions[0], null, 2));
    }

    // Group by location
    const exhibitionsByLocation = {};

    exhibitions.forEach(ex => {
      let loc = ex.location;
      
      // Fallback for missing location
      if (!loc) {
        if (ex.country === 'CU') {
          loc = 'Havana';
        } else if (ex.country) {
          loc = ex.country;
        }
      }

      if (!loc) return;
      
      // Normalize location (trim)
      loc = loc.trim();
      
      if (!exhibitionsByLocation[loc]) {
        exhibitionsByLocation[loc] = [];
      }
      
      exhibitionsByLocation[loc].push(ex);
    });

    // For each location, sort by date (newest first) and pick the most relevant one (or keep all)
    // The user wants "information on the location/exhibition". 
    // Let's keep the most recent one as the "primary" exhibition for the popup, 
    // but maybe we can show a count or list if needed. 
    // For now, let's just store the most recent one to keep the map data simple.
    
    const locationData = {};
    
    for (const [loc, exList] of Object.entries(exhibitionsByLocation)) {
      // Sort by year descending (if available)
      exList.sort((a, b) => (b.year || 0) - (a.year || 0));
      
      // Pick the newest
      const newest = exList[0];
      
      locationData[loc] = {
        title: newest.title,
        institution: newest.institution,
        date: newest.year,
        imageUrl: newest.imageUrl,
        count: exList.length,
        shows: exList.map(ex => ({
          title: ex.title,
          institution: ex.institution,
          date: ex.year,
          imageUrl: ex.imageUrl
        }))
      };
    }

    console.log('Extracted data for locations:', Object.keys(locationData).length);
    
    // Output to a file
    const outputPath = path.join(__dirname, '../src/data/exhibition-map-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(locationData, null, 2));
    console.log(`Data written to ${outputPath}`);

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

extractExhibitionMapData();
