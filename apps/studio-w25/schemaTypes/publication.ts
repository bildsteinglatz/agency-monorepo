import { defineType } from 'sanity';

export default defineType({
  name: 'publication',
  title: 'Publication',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Book Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'mainImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }
      ],
      validation: Rule => Rule.required(),
    },
    {
      name: 'bookFacts',
      title: 'Impressum / Book Facts',
      type: 'object',
      fields: [
        { name: 'publisher', title: 'Verlag', type: 'string' },
        { name: 'price', title: 'Price', type: 'string' },
        { name: 'isbn', title: 'ISBN', type: 'string' },
        { name: 'purchaseLink', title: 'Purchase Link', type: 'url' },
        { 
          name: 'availability', 
          title: 'Availability', 
          type: 'string',
          options: {
            list: [
              { title: 'Available', value: 'available' },
              { title: 'Sold Out', value: 'sold-out' },
              { title: 'Pre-order', value: 'pre-order' }
            ]
          }
        },
        { name: 'editors', title: 'Editors (Hg.)', type: 'string' },
        { 
          name: 'authors', 
          title: 'Authors', 
          type: 'array', 
          of: [{ type: 'string' }],
          options: { layout: 'tags' }
        },
        { name: 'design', title: 'Design', type: 'string' },
        { name: 'language', title: 'Language', type: 'string' },
        { name: 'edition', title: 'Edition', type: 'string', placeholder: 'e.g. 1st Edition, 500 copies' },
        { name: 'binding', title: 'Binding', type: 'string' },
        { name: 'dimensions', title: 'Dimensions', type: 'string', placeholder: 'e.g. 21 x 28 cm' },
        { name: 'pages', title: 'Pages', type: 'number' },
        { name: 'publishedDate', title: 'Publication Date', type: 'date' },
      ],
      options: {
        collapsible: true,
        collapsed: false
      }
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'A brief summary of the publication.',
    },
    {
      name: 'previewImages',
      title: 'Preview (Look Inside)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Selected pages or spreads to show as a preview.',
    },
    {
      name: 'pdf',
      title: 'PDF',
      type: 'file',
      options: {
        accept: '.pdf',
      },
      description: 'Upload a PDF version or excerpt of the publication.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      subtitle: 'bookFacts.publisher'
    }
  }
});
