import { defineField, defineType } from 'sanity'
import { seoFields } from './seo'

export default defineType({
    name: 'artist',
    title: 'Artist',
    type: 'document',
    groups: [
        {
            name: 'status',
            title: 'Status & Categorization',
        },
    ],
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
            name: 'vorname',
            title: 'Vorname',
            type: 'string',
            description: 'Leave empty for groups',
        }),
        defineField({
            name: 'name',
            title: 'Name / Gruppe',
            type: 'string',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: (doc) => `${doc.vorname || ''} ${doc.name || ''}`.trim(),
                maxLength: 96,
            },
        }),
        defineField({
            name: 'website',
            title: 'External Website',
            type: 'url',
        }),
        defineField({
            name: 'years',
            title: 'Years',
            type: 'array',
            group: 'status',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: '2022', value: '2022' },
                    { title: '2023', value: '2023' },
                    { title: '2024', value: '2024' },
                    { title: '2025', value: '2025' },
                    { title: '2026', value: '2026' },
                ],
                layout: 'grid',
            },
        }),
        defineField({
            name: 'artistType',
            title: 'Artist Type',
            type: 'array',
            group: 'status',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'Alle', value: 'alle' },
                    { title: 'Temporär-Studio', value: 'temporar' },
                    { title: 'Resident-Studio', value: 'stationar' },
                    { title: 'Praktikum', value: 'praktikum' },
                    { title: 'Artist in Residence', value: 'artist_in_residence' },
                ],
                layout: 'grid',
            },
        }),
        defineField({
            name: 'focus',
            title: 'Angebote',
            type: 'array',
            group: 'status',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'Workshops', value: 'workshops' },
                    { title: 'Mentoring', value: 'mentoring' },
                    { title: 'Shop', value: 'shop' },
                    { title: 'Pinguin', value: 'pinguin' },
                ],
                layout: 'grid',
            },
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'array',
            of: [
                {
                    title: 'Block',
                    type: 'block',
                    styles: [{ title: 'Normal', value: 'normal' }],
                    lists: [],
                },
            ],
        }),
        defineField({
            name: 'showOnWebsite',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
        }),
    ],
    preview: {
        select: {
            vorname: 'vorname',
            name: 'name',
            media: 'image',
        },
        prepare({ vorname, name, media }) {
            return {
                title: `${vorname || ''} ${name || ''}`.trim(),
                media,
            }
        },
    },
})
