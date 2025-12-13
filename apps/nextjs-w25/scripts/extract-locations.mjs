import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const query = `*[_type == "exhibition"] {
  "venue": coalesce(venue->, venue) {
    name,
    city,
    country
  }
}`

async function run() {
  try {
    const exhibitions = await client.fetch(query)
    const locations = new Set()
    
    exhibitions.forEach(ex => {
      if (ex.venue && ex.venue.city) {
        const loc = `${ex.venue.city}, ${ex.venue.country || ''}`
        locations.add(loc)
      }
    })

    console.log(JSON.stringify(Array.from(locations), null, 2))
  } catch (err) {
    console.error(err)
  }
}

run()
