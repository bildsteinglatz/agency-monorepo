import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // Needs write access
  useCdn: false,
})

const migrateExhibitions = async () => {
  console.log('Starting migration...')
  
  // Fetch all exhibitions that have a 'type' field
  const exhibitions = await client.fetch(`*[_type == "exhibition" && defined(type)] {
    _id,
    _rev,
    title,
    type,
    exhibitionType
  }`)

  console.log(`Found ${exhibitions.length} exhibitions with legacy 'type' field.`)

  const transaction = client.transaction()

  for (const exhibition of exhibitions) {
    console.log(`Processing: ${exhibition.title} (${exhibition._id})`)
    
    const patch = client.patch(exhibition._id)
    
    // If exhibitionType is missing, copy it from type
    if (!exhibition.exhibitionType && exhibition.type) {
      console.log(`  -> Setting exhibitionType to '${exhibition.type}'`)
      patch.set({ exhibitionType: exhibition.type })
    }

    // Unset the legacy 'type' field
    console.log(`  -> Unsetting 'type' field`)
    patch.unset(['type'])
    
    transaction.patch(patch)
  }

  if (exhibitions.length > 0) {
    console.log('Committing transaction...')
    try {
      const result = await transaction.commit()
      console.log('Migration successful!', result)
    } catch (err) {
      console.error('Migration failed:', err.message)
    }
  } else {
    console.log('No documents needed migration.')
  }
}

migrateExhibitions()
