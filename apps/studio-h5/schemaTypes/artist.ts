import { defineField, defineType } from 'sanity'

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
                    { title: 'Temporär', value: 'temporar' },
                    { title: 'Stationär', value: 'stationar' },
                    { title: 'Praktikum', value: 'praktikum' },
                ],
                layout: 'grid',
            },
        }),
        defineField({
            name: 'focus',
            title: 'Activities / Focus',
            type: 'array',
            group: 'status',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'Workshops', value: 'workshops' },
                    { title: 'Mentoring', value: 'mentoring' },
                    { title: 'Kunstproduktion', value: 'kunstproduktion' },
                    { title: 'Shop', value: 'shop' },
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
