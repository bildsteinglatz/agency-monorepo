import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import schemas from './schemaTypes/index.js';

export default defineConfig({
  name: 'default',
  title: 'Art Management',

  projectId: 'yh2vvooq',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Custom Group for Exhibitions
            S.listItem()
              .title('Exhibitions')
              .child(
                S.list()
                  .title('Exhibitions')
                  .items([
                    S.documentTypeListItem('exhibition').title('All Exhibitions'),
                    S.listItem()
                      .title('Exhibition Order (Visual List)')
                      .child(
                        S.document()
                          .schemaType('exhibitionOrder')
                          .documentId('exhibitionOrder')
                          .title('Exhibition Order')
                      ),
                    S.divider(),
                    S.documentTypeListItem('venue').title('Venues'),
                  ])
              ),
            // Custom Group for Artworks
            S.listItem()
              .title('Artworks')
              .child(
                S.list()
                  .title('Artworks')
                  .items([
                    S.documentTypeListItem('artwork').title('All Artworks'),
                    S.listItem()
                      .title('Artwork Order (Visual List)')
                      .child(
                        S.document()
                          .schemaType('artworkOrder')
                          .documentId('artworkOrder')
                          .title('Artwork Order')
                      ),
                    S.divider(),
                    S.documentTypeListItem('category').title('Categories'),
                    S.documentTypeListItem('categoryType').title('Category Types'),
                  ])
              ),
            // List all other document types, filtering out the ones we manually added
            ...S.documentTypeListItems().filter(
              (listItem) => {
                const id = listItem.getId()
                return typeof id === 'string' && !['exhibition', 'exhibitionOrder', 'venue', 'artwork', 'artworkOrder', 'category', 'categoryType'].includes(id)
              }
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemas,
  },
});