import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'pinguin',
    title: 'Offenes Atelier Pinguin',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Page Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
            },
        }),
        defineField({
            name: 'seoDescription',
            title: 'SEO Description',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'youtubeId',
            title: 'YouTube Video ID',
            type: 'string',
            description: 'Just the ID from the YouTube URL (e.g., dQw4w9WgXcQ)',
        }),
        defineField({
            name: 'heroSubtitle',
            title: 'Hero Subtitle',
            type: 'string',
            description: 'e.g. Kreativatelier für Kinder & Jugendliche',
        }),
        defineField({
            name: 'introduction',
            title: 'Introduction',
            type: 'array',
            of: [{ type: 'block' }],
            description: 'Opening text for the page',
        }),
        defineField({
            name: 'featureBlocks',
            title: 'Feature Blocks',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'title',
                            title: 'Block Title',
                            type: 'string',
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: 'navLabel',
                            title: 'Navigation Label',
                            type: 'string',
                            description: 'Short label for the navigation menu (e.g. "Flow!" instead of "Flow State"). If empty, uses Title.',
                        },
                        {
                            name: 'description',
                            title: 'Description',
                            type: 'array',
                            of: [{ type: 'block' }],
                        },
                        {
                            name: 'colorHex',
                            title: 'Background Color',
                            type: 'string',
                            description: 'Hex color (e.g., #FF3100, #00FF00)',
                        },
                        {
                            name: 'layoutType',
                            title: 'Layout Type',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Full Width', value: 'full' },
                                    { title: 'Half Width', value: 'half' },
                                ],
                            },
                            initialValue: 'full',
                        },
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            layoutType: 'layoutType',
                        },
                        prepare({ title, layoutType }) {
                            return {
                                title: title,
                                subtitle: layoutType === 'full' ? '🔲 Full Width' : '◻️ Half Width',
                            }
                        },
                    },
                },
            ],
        }),
        defineField({
            name: 'team',
            title: 'Team Members',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'pinguinteam' }],
                },
            ],
        }),
        defineField({
            name: 'schedule',
            title: 'Schedule',
            type: 'object',
            fields: [
                {
                    name: 'days',
                    title: 'Days',
                    type: 'string',
                    description: 'e.g., Donnerstag & Freitag',
                },
                {
                    name: 'time',
                    title: 'Time',
                    type: 'string',
                    description: 'e.g., 14:00 - 17:00 Uhr',
                },
                {
                    name: 'cost',
                    title: 'Cost',
                    type: 'string',
                    description: 'e.g., Freiwillige Spende',
                },
            ],
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
            name: 'showOnWebsite',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
        }),
    ],
})
