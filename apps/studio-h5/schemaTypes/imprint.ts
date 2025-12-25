import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'imprint',
  title: 'Impressum',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Impressum',
    }),
    defineField({
      name: 'content',
      title: 'Impressum Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'privacyContent',
      title: 'Datenschutz Content',
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
