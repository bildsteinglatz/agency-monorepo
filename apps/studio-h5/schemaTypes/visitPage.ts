import { defineField, defineType } from 'sanity'
import { seoFields } from './seo'

export default defineType({
    name: 'visitPage',
    title: 'Besuchen',
    type: 'document',
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
