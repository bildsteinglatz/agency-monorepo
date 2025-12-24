import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'productionArtist',
    title: 'Production Artist',
    type: 'document',
    fields: [
        defineField({
            name: 'vorname',
            title: 'Vorname',
            type: 'string',
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
            of: [{ type: 'block' }],
        }),
    ],
})
