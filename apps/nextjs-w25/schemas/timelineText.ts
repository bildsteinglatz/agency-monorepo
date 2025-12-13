import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'timelineText',
  title: 'Timeline Text',
  type: 'document',
  fields: [
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1900).max(2100),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: 'year',
      subtitle: 'text',
    },
  },
})
