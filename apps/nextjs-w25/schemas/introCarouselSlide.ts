import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'introSlide',
  title: 'Intro Slide',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal title for reference',
    }),
    defineField({
      name: 'statement',
      title: 'Statement',
      type: 'text',
      rows: 3,
      description: 'The text to display in the center',
    }),
    defineField({
      name: 'backgroundWorkImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isFinalEntryScreen',
      title: 'Is Final Entry Screen',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'statement',
      media: 'backgroundWorkImage',
    },
  },
})
