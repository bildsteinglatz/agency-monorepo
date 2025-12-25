import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'emailTemplate',
  title: 'Email Template',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Template Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subject',
      title: 'Subject Line',
      type: 'string',
      description: 'Placeholders: {{userName}}, {{workshopTitle}}, {{workshopDate}}',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body Text (HTML)',
      type: 'text',
      description: 'HTML content. Placeholders: {{userName}}, {{workshopTitle}}, {{workshopDate}}',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
