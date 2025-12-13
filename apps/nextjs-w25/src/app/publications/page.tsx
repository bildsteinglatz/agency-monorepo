import { Metadata } from 'next'
import { client } from '@/sanity/client'
import { PUBLICATIONS_QUERY } from '@/sanity/queries'
import { Publication } from '@/types/publication'
import PublicationsClient from './PublicationsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Publications | Bildstein | Glatz',
  description: 'Books, catalogues and publications by Bildstein | Glatz.',
}

export default async function PublicationsPage() {
  const publications = await client.fetch<Publication[]>(PUBLICATIONS_QUERY)

  return <PublicationsClient publications={publications} />
}
