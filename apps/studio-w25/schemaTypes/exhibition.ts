import { defineType } from 'sanity';

export default defineType({
  name: 'exhibition',
  title: 'Exhibition',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: Rule => Rule.required(),
    },
    {
      name: 'artist',
      title: 'Artist(s)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artist' }] }],
    },
    {
      name: 'venue',
      title: 'Venue',
      type: 'reference',
      to: [{ type: 'venue' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'exhibitionType',
      title: 'Exhibition Type',
      type: 'string',
      options: {
        list: [
          { title: 'Solo Exhibitions', value: 'solo' },
          { title: 'Group Exhibitions', value: 'group' },
          { title: 'Works in public space', value: 'public_space' },
        ],
      },
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'text',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true, // For responsive cropping
          },
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
      name: 'weblink',
      title: 'Web Link',
      type: 'url',
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'showInSelectedExhibitions',
      title: 'Show in Selected Exhibitions',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'title',
      venue: 'venue.name',
      year: 'year',
      media: 'mainImage',
    },
    prepare(selection) {
      const { title, venue, year } = selection;
      return {
        title: title,
        subtitle: `${venue} (${year})`,
        media: selection.media,
      };
    },
  },
});