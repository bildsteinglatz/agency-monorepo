import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'halle5Info',
    title: 'Halle 5 Info',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
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
            name: 'about',
            title: 'About',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'contactEmail',
            title: 'Contact Email',
            type: 'string',
        }),
        defineField({
            name: 'address',
            title: 'Address',
            type: 'text',
        }),
        defineField({
            name: 'openingHours',
            title: 'Opening Hours',
            type: 'text',
        }),
        defineField({
            name: 'googleMapsLink',
            title: 'Google Maps Link',
            type: 'url',
        }),
    ],
})
