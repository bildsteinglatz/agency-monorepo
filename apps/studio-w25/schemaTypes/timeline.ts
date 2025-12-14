import { defineType } from 'sanity';

export default defineType({
  name: 'timeline',
  title: 'Timeline',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: Rule => Rule.required(),
    },
    {
      name: 'size',
      title: 'Size',
      type: 'string',
      options: {
        list: [
          { title: 'Small', value: 'small' },
          { title: 'Medium', value: 'medium' },
          { title: 'Large', value: 'large' },
          { title: 'X-Large', value: 'xlarge' },
        ],
        layout: 'radio'
      },
      initialValue: 'medium',
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }
      ]
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }
          ]
        }
      ]
    },
    {
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*'
      },
      description: 'Upload a video file directly.'
    },
    {
      name: 'information',
      title: 'Information',
      type: 'text',
      rows: 4,
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      media: 'mainImage',
    },
    prepare(selection) {
      const { title, date, media } = selection;
      return {
        title: title,
        subtitle: date,
        media: media,
      };
    },
  },
});
