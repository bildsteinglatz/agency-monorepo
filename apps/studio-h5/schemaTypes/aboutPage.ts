import { defineField, defineType } from 'sanity'
import { seoFields } from './seo'

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
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
      title: 'Page Title',
      type: 'string',
      initialValue: 'Über uns',
    }),
    defineField({
      name: 'adlassniggKG',
      title: 'Adlassnigg KG',
      type: 'object',
      fields: [
        defineField({ name: 'title', type: 'string', title: 'Title' }),
        defineField({ name: 'text', type: 'array', of: [{ type: 'block' }], title: 'Text' }),
        defineField({ name: 'email', type: 'string', title: 'Contact Email' }),
      ],
    }),
    defineField({
      name: 'kulturvereinHalle5',
      title: 'Kulturverein Halle 5',
      type: 'object',
      fields: [
        defineField({ name: 'title', type: 'string', title: 'Title' }),
        defineField({ name: 'text', type: 'array', of: [{ type: 'block' }], title: 'Text' }),
        defineField({ name: 'email', type: 'string', title: 'Contact Email' }),
      ],
    }),
    defineField({
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
