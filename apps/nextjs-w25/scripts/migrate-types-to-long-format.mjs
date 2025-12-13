import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // Needs write access
  useCdn: false,
})

const migrateExhibitionTypes = async () => {
  console.log('Starting migration to new exhibition types...')
  
  // Fetch all exhibitions
  const exhibitions = await client.fetch(`*[_type == "exhibition"] {
    _id,
    _rev,
    title,
    exhibitionType
  }`)

  console.log(`Found ${exhibitions.length} exhibitions.`)

  const transaction = client.transaction()
  let count = 0

  for (const exhibition of exhibitions) {
    let newType = null

    if (exhibition.exhibitionType === 'solo') {
      newType = 'solo exhibitions'
    } else if (exhibition.exhibitionType === 'group') {
      newType = 'group exhibitions'
    } else if (exhibition.exhibitionType === 'public_space') {
      newType = 'works in public space'
    }

    if (newType) {
      console.log(`Updating '${exhibition.title}': ${exhibition.exhibitionType} -> ${newType}`)
      transaction.patch(exhibition._id, p => p.set({ exhibitionType: newType }))
      count++
    }
  }

  if (count > 0) {
    console.log(`Committing updates for ${count} documents...`)
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

migrateExhibitionTypes()
