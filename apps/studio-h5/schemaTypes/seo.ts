import { defineField } from 'sanity'

export const seoFields = [
    defineField({
        name: 'seoTitle',
        title: 'SEO Title',
        type: 'string',
        description: 'Title for search engines and social media. Ideally between 50-60 characters.',
    }),
    defineField({
        name: 'seoDescription',
        title: 'SEO Description',
        type: 'text',
        rows: 3,
        description: 'Description for search engines and social media. Ideally between 150-160 characters.',
    }),
    defineField({
        name: 'seoImage',
        title: 'SEO Image',
        type: 'image',
        description: 'Image for social media sharing (Open Graph). Recommended size: 1200x630px.',
    }),
]
