import { Metadata } from 'next'
import { urlFor } from '@/sanity/image'

export function generatePageMetadata(seo: any, defaultTitle: string, defaultDescription: string): Metadata {
    const title = seo?.seoTitle || defaultTitle
    const description = seo?.seoDescription || defaultDescription
    const image = seo?.seoImage ? urlFor(seo.seoImage).width(1200).height(630).url() : '/opengraph-image.png'

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: image }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    }
}
