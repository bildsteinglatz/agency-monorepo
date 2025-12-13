
import { createClient } from 'next-sanity'
import { config } from 'dotenv'

config({ path: '.env.local' })

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function checkSlides() {
  try {
    // Check all types
    const allTypes = await client.fetch(`count(*[])`)
    console.log('Total documents in dataset:', allTypes)

    const types = await client.fetch(`array::unique(*[]._type)`)
    console.log('Document types found:', types)

    const slides = await client.fetch(`*[_type == "introSlide"] | order(order asc) {
      _id,
      title,
      statement,
      "image": backgroundWorkImage {
        asset-> {
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        },
        alt
      }
    }`)
    console.log('Number of introSlide found with projection:', slides.length)
    
    if (slides.length > 0) {
      console.log('First slide projected:', JSON.stringify(slides[0], null, 2))
    }
  } catch (error) {
    console.error('Error fetching slides:', error)
  }
}

checkSlides()
