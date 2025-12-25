import { defineField, defineType } from 'sanity'
import { seoFields } from './seo'

export default defineType({
  name: 'halle5Konzept',
  title: 'Halle 5 Konzept',
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
      title: 'Titel',
      type: 'string',
      initialValue: 'Halle 5 Konzept',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
