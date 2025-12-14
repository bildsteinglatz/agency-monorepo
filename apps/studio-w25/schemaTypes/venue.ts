import { defineType } from 'sanity';

export default defineType({
  name: 'venue',
  title: 'Venue',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Museum', value: 'museum' },
          { title: 'Kunstraum', value: 'kunstraum' },
          { title: 'Gallery', value: 'gallery' },
          { title: 'Studio', value: 'studio' },
          { title: 'Offspace', value: 'offspace' },
          { title: 'Public Space', value: 'public-space' },
          { title: 'Institution', value: 'institution' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio'
      },
      initialValue: 'gallery',
      validation: Rule => Rule.required(),
    },
    {
      name: 'city',
      title: 'City',
      type: 'string',
    },
    {
      name: 'country',
      title: 'Country',
      type: 'string',
    },
    {
      name: 'location',
      title: 'Map Location',
      type: 'geopoint',
      description: 'Exact location for the World Map',
    },
    {
      name: 'url',
      title: 'Website',
      type: 'url',
    },
  ],
  preview: {
    select: {
      title: 'name',
      city: 'city',
      country: 'country',
      category: 'category',
    },
    prepare(selection) {
      const { title, city, country, category } = selection;
      const location = [city, country].filter(Boolean).join(', ');
      // Capitalize category for subtitle
      const cat = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
      
      return {
        title: title,
        subtitle: `${cat} • ${location}`,
      };
    },
  },
});