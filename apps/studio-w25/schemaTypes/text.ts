import { defineType } from 'sanity';

export default defineType({
  name: 'textDocument', // Changed from 'text' to 'textDocument'
  title: 'Texts',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
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
      name: 'author',
      title: 'Author',
      type: 'string',
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'German', value: 'de' },
          { title: 'French', value: 'fr' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
    {
      name: 'textContent',
      title: 'Text Content',
      type: 'text',
    },
    {
      name: 'weblink',
      title: 'Web Link',
      type: 'url',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Review', value: 'review' },
          { title: 'Artist Statement', value: 'statement' },
          { title: 'Exhibition Text', value: 'exhibition' },
          { title: 'Catalog Text', value: 'catalog' },
          { title: 'Interview', value: 'interview' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
    {
      name: 'originalPdf',
      title: 'Original PDF',
      type: 'file',
      options: {
        accept: '.pdf',
      },
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
      description: 'Control whether this text is displayed on the frontend website',
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
      ],
      description: 'Additional images related to this text',
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      category: 'category',
    },
    prepare(selection) {
      const { title, author, category } = selection;
      return {
        title: title,
        subtitle: `${author} - ${category}`,
      };
    },
  },
});
