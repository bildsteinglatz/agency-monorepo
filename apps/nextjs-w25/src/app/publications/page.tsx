import { Metadata } from 'next';
import { Suspense } from 'react';
import { client } from '@/sanity/client';
import { PUBLICATIONS_QUERY } from '@/sanity/queries';
import { PublicationsClient } from '@/components/publications/PublicationsClient';
import { Publication } from '@/types/publication';

export const metadata: Metadata = {
  title: 'Publications | Bildstein | Glatz',
  description: 'Catalogues, books and publications by Bildstein | Glatz.',
};

export default async function PublicationsPage() {
  let publications: Publication[] = [];

  try {
    publications = await client.fetch<Publication[]>(PUBLICATIONS_QUERY);
    console.log('Fetched publications:', publications.length, publications);
  } catch (error) {
    console.error('Failed to fetch publications:', error);
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <PublicationsClient publications={publications} />
      </Suspense>
    </div>
  );
}
