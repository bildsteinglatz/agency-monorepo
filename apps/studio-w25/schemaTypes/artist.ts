import { defineType } from 'sanity';

export default defineType({
  name: 'artist',
  title: 'Artist',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'born',
      title: 'Born',
      type: 'date',
    },
    {
      name: 'bio',
      title: 'Biography',
      type: 'text',
    },
    {
      name: 'website',
      title: 'Website',
      type: 'url',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'born',
    },
  },
});