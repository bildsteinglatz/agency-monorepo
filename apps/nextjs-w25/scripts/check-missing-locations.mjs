
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON data
const dataPath = path.join(__dirname, '../src/data/exhibition-map-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const dataKeys = Object.keys(data);

// Read the component file to extract LOCATIONS
const componentPath = path.join(__dirname, '../src/components/StudioMap.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf8');

// Extract the EXHIBITION_LOCATIONS array content
const match = componentContent.match(/const EXHIBITION_LOCATIONS = \[([\s\S]*?)\];/);
if (!match) {
  console.error('Could not find EXHIBITION_LOCATIONS in StudioMap.tsx');
  process.exit(1);
}

const locationsContent = match[1];
const locationNames = [];
const regex = /name:\s*'([^']+)'/g;
let m;

while ((m = regex.exec(locationsContent)) !== null) {
  // Extract city name (before comma)
  const city = m[1].split(',')[0].trim();
  locationNames.push(city);
}

console.log('Locations in Component:', locationNames.length);
console.log('Locations in Data:', dataKeys.length);

const missing = dataKeys.filter(key => !locationNames.includes(key));

console.log('\nMissing locations (in Data but not in Component):');
missing.forEach(loc => console.log(`- ${loc}`));
