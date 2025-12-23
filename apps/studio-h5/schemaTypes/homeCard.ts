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
      title: 'Text',
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
      name: 'bgColor',
      title: 'Background Color',
      type: 'string',
      description: 'Hex color code (e.g. #FF3100). If empty, uses theme defaults.',
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'string',
      options: {
        list: [
          { title: 'Black', value: 'black' },
          { title: 'White', value: 'white' },
        ],
      },
      initialValue: 'black',
    }),
    defineField({
      name: 'ctaBgColor',
      title: 'Button Background Color',
      type: 'string',
      description: 'Hex color code (e.g. #facc15). If empty, uses theme defaults.',
    }),
    defineField({
      name: 'dark',
      title: 'Dark Theme (Legacy)',
      type: 'boolean',
      initialValue: false,
      description: 'Legacy toggle for black background',
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight Theme (Legacy)',
      type: 'boolean',
      initialValue: false,
      description: 'Legacy toggle for red background',
    }),
    defineField({
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
