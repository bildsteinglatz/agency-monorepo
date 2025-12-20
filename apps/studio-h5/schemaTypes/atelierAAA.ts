import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'atelierAAA',
    title: 'Atelier AAA',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title (SEO)',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'seoDescription',
            title: 'SEO Description',
            type: 'text',
            rows: 3,
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
    ],
})
