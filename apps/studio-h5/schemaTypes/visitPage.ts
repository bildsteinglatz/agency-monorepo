import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'visitPage',
    title: 'Besuchen',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Besuchen',
        }),
        defineField({
            name: 'visitPanel',
            title: 'Besuchen Panel',
            type: 'visitPanel',
        }),
        defineField({
            name: 'showOnWebsite',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
        }),
    ],
})
