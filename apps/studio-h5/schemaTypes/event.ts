import { defineField, defineType } from 'sanity'
import { seoFields } from './seo'

export default defineType({
    name: 'event',
    title: 'Event / News',
    type: 'document',
    fields: [
        defineField({
            name: 'seo',
            title: 'SEO & Social Media',
            type: 'object',
            fields: seoFields,
            options: {
                collapsible: true,
                collapsed: true,
            },
        }),
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
        }),
        defineField({
            name: 'dates',
            title: 'Dates',
            type: 'array',
            of: [{ type: 'datetime' }],
            description: 'Add one or more dates for this event',
        }),
        defineField({
            name: 'image',
            title: 'Main Image (Legacy)',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'gallery',
            title: 'Image Gallery',
            type: 'array',
            of: [
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative Text',
                        }
                    ]
                }
            ],
        }),
        defineField({
            name: 'video',
            title: 'Video File',
            type: 'file',
            options: {
                accept: 'video/*',
            },
        }),
        defineField({
            name: 'youtubeUrl',
            title: 'YouTube URL',
            type: 'url',
            description: 'Link to a YouTube video',
        }),
        defineField({
            name: 'vimeoUrl',
            title: 'Vimeo URL',
            type: 'url',
            description: 'Link to a Vimeo video',
        }),
        defineField({
            name: 'website',
            title: 'Website URL',
            type: 'url',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'showOnWebsite',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
        }),
    ],
})
