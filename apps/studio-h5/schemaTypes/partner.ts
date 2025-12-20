import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'partner',
    title: 'Partner / Fördergeber',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'logo',
            title: 'Logo',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'url',
            title: 'URL',
            type: 'url',
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Fördergeber', value: 'sponsor' },
                    { title: 'Kooperationspartner', value: 'partner' },
                ],
            },
        }),
    ],
})
