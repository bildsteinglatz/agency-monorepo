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
  useCdn: false,
})

const checkTypes = async () => {
  console.log('Checking unique exhibition types...')
  
  const types = await client.fetch(`*[_type == "exhibition"].exhibitionType`)
  const uniqueTypes = [...new Set(types)]
  
  console.log('Unique exhibition types found:', uniqueTypes)

  const specialExhibitions = await client.fetch(`*[_type == "exhibition" && !(exhibitionType in ["solo", "group"])] {
    title,
    exhibitionType
  }`)
  console.log('Exhibitions with special types:', specialExhibitions)
}

checkTypes()
