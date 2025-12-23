import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'rolandAdlassnigg',
  title: 'Roland Adlassnigg',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Roland Adlassnigg',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Biography / Work Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
