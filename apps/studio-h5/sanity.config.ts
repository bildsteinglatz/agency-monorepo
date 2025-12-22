import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { calendarPlugin } from 'sanity-plugin-events-calendar'
import { schemaTypes } from './schemaTypes'

const singletonTypes = new Set(['halle5Info', 'atelierAAA', 'pinguin', 'visitPage'])
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'Studio-h5',

  projectId: 'gi77yzcp',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Singleton
            S.listItem()
              .title('Home Page')
              .id('halle5Info')
              .child(
                S.document()
                  .schemaType('halle5Info')
                  .documentId('halle5Info')
              ),
            S.listItem()
              .title('Besuchen')
              .id('visitPage')
              .child(
                S.document()
                  .schemaType('visitPage')
                  .documentId('visitPage')
              ),
            S.listItem()
              .title('Atelier AAA')
              .id('atelierAAA')
              .child(
                S.document()
                  .schemaType('atelierAAA')
                  .documentId('atelierAAA')
              ),
            S.listItem()
              .title('Atelier Pinguin')
              .id('pinguin')
              .child(
                S.document()
                  .schemaType('pinguin')
                  .documentId('pinguin')
              ),
            // Regular documents
            S.documentTypeListItem('artist').title('Artists'),
            S.documentTypeListItem('workshop').title('Workshops'),
            S.documentTypeListItem('event').title('Events'),
            S.documentTypeListItem('membership').title('Memberships'),
            S.documentTypeListItem('partner').title('Partners'),
            S.documentTypeListItem('atelier').title('Ateliers'),
            S.documentTypeListItem('pinguinteam').title('Pinguin Team'),
          ]),
    }),
    visionTool(),
    calendarPlugin(),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
})
