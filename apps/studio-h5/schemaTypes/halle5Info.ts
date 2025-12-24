import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'halle5Info',
    title: 'Halle 5 Info',
    type: 'document',
    fields: [
        defineField({
            name: 'heroImage',
            title: 'Hero Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            hidden: ({ document }) => document?.heroType !== 'image',
        }),
        defineField({
            name: 'heroType',
            title: 'Hero Background Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Image', value: 'image' },
                    { title: 'Video', value: 'video' },
                    { title: 'Color', value: 'color' },
                ],
                layout: 'radio',
            },
            initialValue: 'image',
        }),
        defineField({
            name: 'heroVideo',
            title: 'Hero Video',
            type: 'file',
            options: {
                accept: 'video/*',
            },
            hidden: ({ document }) => document?.heroType !== 'video',
        }),
        defineField({
            name: 'heroColor',
            title: 'Hero Color',
            type: 'string',
            description: 'Hex color code (e.g. #000000)',
            hidden: ({ document }) => document?.heroType !== 'color',
        }),
        defineField({
            name: 'cards',
            title: 'Content Cards',
            type: 'array',
            of: [{ type: 'homeCard' }],
        }),
        defineField({
            name: 'showOnWebsite',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
        }),
    ],
})
