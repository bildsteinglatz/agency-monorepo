import { defineType } from 'sanity';

export default defineType({
  name: 'timelineText',
  title: 'Timeline Text',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Text Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'date',
      title: 'Text Date',
      type: 'date',
      validation: Rule => Rule.required(),
    },
    {
      name: 'text',
      title: 'Text',
      type: 'text',
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
    },
    prepare(selection) {
      const { title, date } = selection;
      return {
        title: title,
        subtitle: date,
      };
    },
  },
});
