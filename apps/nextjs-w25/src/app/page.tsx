import { safeFetch } from '@/sanity/safeFetch'
import { HomeClient } from '@/components/HomeClient'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export const metadata = {
    title: "Bildstein | Glatz",
    description: "Contemporary art by the Austrian-Swiss artist duo Bildstein | Glatz.",
};

export default async function HomePage() {
    redirect('/artworks-ii');
}

