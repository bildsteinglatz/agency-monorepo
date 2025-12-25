import { defineField, defineType } from 'sanity'
import { seoFields } from './seo'

export default defineType({
    name: 'atelierAAA',
    title: 'Atelier AAA',
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
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'heroText',
            title: 'Hero Text (Subtitle)',
            type: 'string',
        }),
        defineField({
            name: 'heroImage',
            title: 'Hero Image',
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
            name: 'videoUrl',
            title: 'Video URL (Vimeo or YouTube)',
            type: 'url',
        }),
        defineField({
            name: 'contentBlock1',
            title: 'Main Content (Top)',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'contentBlock2',
            title: 'Main Content (Bottom)',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'institutions',
            title: 'Institutions',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'institution' }] }],
        }),
        defineField({
            name: 'artists',
            title: 'Artists',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'productionArtist' }] }],
        }),
        defineField({
            name: 'showOnWebsite',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
        }),
    ],
})
