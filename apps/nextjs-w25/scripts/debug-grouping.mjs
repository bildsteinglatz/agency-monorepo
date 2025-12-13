
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'yh2vvooq',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const query = `*[_type == "artwork" && showOnWebsite == true && defined(bodyOfWork)] {
  _id,
  title,
  "bodyOfWork": bodyOfWork->{
    _id,
    title
  },
  "fieldOfArt": fieldOfArt->{
    _id,
    title
  }
}[0...100]`

async function run() {
  try {
    const artworks = await client.fetch(query)
    console.log(`Fetched ${artworks.length} artworks with bodyOfWork`)
    
    const grouped = {}
    artworks.forEach(a => {
      if (a.bodyOfWork) {
        const bid = a.bodyOfWork._id
        if (!grouped[bid]) grouped[bid] = []
        grouped[bid].push({ title: a.title, fieldOfArt: a.fieldOfArt?.title })
      }
    })

    Object.keys(grouped).forEach(bid => {
      console.log(`BodyOfWork ${bid}: ${grouped[bid].length} items`)
      console.log(grouped[bid])
    })

  } catch (e) {
    console.error(e)
  }
}

run()
