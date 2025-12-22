import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'event',
    title: 'Event / News',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
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
        }),
        defineField({
            name: 'dates',
            title: 'Dates',
            type: 'array',
            of: [{ type: 'datetime' }],
            description: 'Add one or more dates for this event',
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
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [{ type: 'block' }],
        }),
    ],
})
