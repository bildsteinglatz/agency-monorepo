import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Artworks View | Bildstein | Glatz',
  description: 'Artwork gallery and views',
}

export default function ArtworksViewPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Artworks View</h1>
      <p className="text-black">This is a lightweight placeholder for the artworks view. Replace with the full implementation from backups if needed.</p>
      <div className="mt-6">
        <Link href="/artworks-browse">Browse artworks</Link>
      </div>
    </div>
  )
}
