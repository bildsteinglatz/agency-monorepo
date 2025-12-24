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
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    // Color Customization
    defineField({
      name: 'backgroundColor',
      title: 'Card Background Color',
      type: 'string',
      description: 'Hex code (e.g. #ffffff). Default: White',
      initialValue: '#ffffff',
    }),
    defineField({
      name: 'textColor',
      title: 'Card Text Color',
      type: 'string',
      description: 'Hex code (e.g. #000000). Default: Black',
      initialValue: '#000000',
    }),
    defineField({
      name: 'buttonBackgroundColor',
      title: 'Button Background Color',
      type: 'string',
      description: 'Hex code (e.g. #ffffff). Default: Transparent/White',
    }),
    defineField({
      name: 'buttonTextColor',
      title: 'Button Text Color',
      type: 'string',
      description: 'Hex code (e.g. #000000). Default: Black',
      initialValue: '#000000',
    }),
    defineField({
      name: 'buttonBorderColor',
      title: 'Button Border Color',
      type: 'string',
      description: 'Hex code (e.g. #000000). Default: Black',
      initialValue: '#000000',
    }),
    // Button Hover State
    defineField({
      name: 'buttonHoverBackgroundColor',
      title: 'Button Hover Background Color',
      type: 'string',
      description: 'Hex code. Default: Black',
    }),
    defineField({
      name: 'buttonHoverTextColor',
      title: 'Button Hover Text Color',
      type: 'string',
      description: 'Hex code. Default: White',
    }),
    defineField({
      name: 'buttonHoverBorderColor',
      title: 'Button Hover Border Color',
      type: 'string',
      description: 'Hex code. Default: Black',
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
