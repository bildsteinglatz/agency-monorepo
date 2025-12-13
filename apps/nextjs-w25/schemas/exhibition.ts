export default {
  name: 'exhibition',
  title: 'Exhibition',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'year',
      title: 'Year',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'exhibitionType',
      title: 'Exhibition Type',
      type: 'string',
      options: {
        list: [
          {title: 'Solo Exhibition', value: 'solo'},
          {title: 'Group Exhibition', value: 'group'},
          {title: 'Work in Public Space', value: 'public_space'}
        ]
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'venue',
      title: 'Venue',
      type: 'object',
      fields: [
        {name: 'name', title: 'Name', type: 'string'},
        {name: 'city', title: 'City', type: 'string'},
        {name: 'state', title: 'State/Province', type: 'string'},
        {name: 'country', title: 'Country', type: 'string'}
      ]
    },
    {
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 15
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    },
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            }
          ]
        }
      ]
    },
    {
      name: 'artist',
      title: 'Artists',
      type: 'array',
      of: [{type: 'reference', to: {type: 'artist'}}]
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      venueName: 'venue.name',
      venueCity: 'venue.city'
    },
    prepare({ title, year, venueName, venueCity }: { 
      title: string, 
      year: string, 
      venueName?: string, 
      venueCity?: string 
    }) {
      const venue = [venueName, venueCity].filter(Boolean).join(', ');
      return {
        title,
        subtitle: `${year}${venue ? ` | ${venue}` : ''}`
      }
    }
  }
}
