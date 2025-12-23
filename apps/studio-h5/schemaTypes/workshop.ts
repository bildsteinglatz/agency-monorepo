import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'workshop',
    title: 'Workshop',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
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
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Entwurf', value: 'entwurf' },
                    { title: 'Book Now', value: 'book now' },
                    { title: 'Ausgebucht', value: 'ausgebucht' },
                ],
                layout: 'radio',
            },
            initialValue: 'entwurf',
        }),
        defineField({
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'ablauf',
            title: 'Ablauf',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'dates',
            title: 'Dates',
            type: 'array',
            of: [{ type: 'datetime' }],
            description: 'Add one or more dates for this workshop',
        }),
        defineField({
            name: 'artists',
            title: 'Artists',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'artist' }] }],
        }),
        defineField({
            name: 'showOnWebsite',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
        }),
    ],
})
