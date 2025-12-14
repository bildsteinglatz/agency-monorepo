import { defineType } from 'sanity';

export default defineType({
  name: 'artworkOrder',
  title: 'Artwork Order',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Artwork Order',
      readOnly: true,
      hidden: true,
    },
    {
      name: 'orderedArtworks',
      title: 'Ordered Artworks',
      type: 'array',
      description: 'Drag and drop artworks to change their order on the website.',
      of: [{ type: 'reference', to: [{ type: 'artwork' }] }],
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Artwork Order Configuration',
      };
    },
  },
});
