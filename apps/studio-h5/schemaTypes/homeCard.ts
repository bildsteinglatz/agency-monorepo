import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homeCard',
  title: 'Home Card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'cta',
      title: 'Button Text',
      type: 'string',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'string',
      description: 'Internal path (e.g. /visit) or external URL',
    }),
    defineField({
      name: 'dark',
      title: 'Dark Theme',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight (Border)',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
