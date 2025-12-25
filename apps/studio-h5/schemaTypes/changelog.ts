import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'changelog',
  title: 'Changelog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString().split('T')[0],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'System', value: 'system'},
          {title: 'AI', value: 'ai'},
          {title: 'Game', value: 'game'},
          {title: 'Design', value: 'design'},
          {title: 'Content', value: 'content'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'room',
      title: 'Room / Area',
      type: 'string',
      description: 'e.g. Painting Room, AI Concierge, Membership',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      description: 'Optional link to the new feature',
    }),
  ],
  orderings: [
    {
      title: 'Date, Newest First',
      name: 'dateDesc',
      by: [{field: 'date', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      category: 'category',
    },
    prepare(selection) {
      const {title, date, category} = selection
      return {
        title: `[${category?.toUpperCase()}] ${title}`,
        subtitle: date,
      }
    },
  },
})
