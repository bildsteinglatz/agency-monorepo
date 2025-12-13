import { Rule } from 'sanity';

export default {
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: Rule) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'year',
      title: 'Year',
      type: 'string'
    },
    {
      name: 'medium',
      title: 'Medium',
      type: 'string'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    },
      {
        name: 'fieldOfArt',
        title: 'Field of Art',
        type: 'reference',
        to: [{ type: 'category' }],
        description: 'Discipline or medium (categoryType: field of art)'
      },
      {
        name: 'bodyOfWork',
        title: 'Body of Work',
        type: 'reference',
        to: [{ type: 'category' }],
        description: 'Series or collection (categoryType: body of work)'
      },
    {
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      to: [{type: 'artist'}]
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'vimeoUrl',
      title: 'Vimeo URL',
      type: 'url'
    },
    {
      name: 'vimeoVideo',
      title: 'Main Vimeo Video',
      type: 'object',
      fields: [
        {
          name: 'vimeoUrl',
          title: 'Vimeo URL',
          type: 'url',
          description: 'Paste the full Vimeo video link here',
        }
      ],
      description: 'Main Vimeo video for this artwork (required if no main image)',
    }
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      media: 'mainImage'
    },
    prepare({title, year, media}: {title: any, year: any, media: any}) {
      return {
        title,
        subtitle: year,
        media
      }
    }
  }
}
