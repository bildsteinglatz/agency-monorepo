import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

const singletonTypes = new Set(['halle5Info'])
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
              .title('Halle 5 Info')
              .id('halle5Info')
              .child(
                S.document()
                  .schemaType('halle5Info')
                  .documentId('halle5Info')
              ),
            // Regular documents
            S.documentTypeListItem('artist').title('Artists'),
            S.documentTypeListItem('workshop').title('Workshops'),
            S.documentTypeListItem('event').title('Events'),
          ]),
    }),
    visionTool(),
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
