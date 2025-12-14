import { defineType } from 'sanity';

export default defineType({
  name: 'exhibitionOrder',
  title: 'Exhibition Order',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Exhibition Order',
      readOnly: true,
      hidden: true,
    },
    {
      name: 'orderedExhibitions',
      title: 'Ordered Exhibitions',
      type: 'array',
      description: 'Drag and drop exhibitions to change their order on the website.',
      of: [{ type: 'reference', to: [{ type: 'exhibition' }] }],
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Exhibition Order Configuration',
      };
    },
  },
});
