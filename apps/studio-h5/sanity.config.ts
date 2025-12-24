import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { calendarPlugin } from 'sanity-plugin-events-calendar'
import { schemaTypes } from './schemaTypes'

const singletonTypes = new Set(['halle5Info', 'atelierAAA', 'pinguin', 'visitPage', 'aboutPage', 'imprint', 'rolandAdlassnigg', 'halle5Konzept', 'partnerTexts'])
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
            // --- PAGES ---
            S.listItem()
              .title('Seiten')
              .child(
                S.list()
                  .title('Seiten')
                  .items([
                    S.listItem()
                      .title('Home Page')
                      .id('halle5Info')
                      .child(S.document().schemaType('halle5Info').documentId('halle5Info')),
                    S.listItem()
                      .title('Halle 5 Konzept')
                      .id('halle5Konzept')
                      .child(S.document().schemaType('halle5Konzept').documentId('halle5Konzept')),
                    S.listItem()
                      .title('Über uns')
                      .id('aboutPage')
                      .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
                    S.listItem()
                      .title('Besuchen')
                      .id('visitPage')
                      .child(S.document().schemaType('visitPage').documentId('visitPage')),
                    S.listItem()
                      .title('Atelier AAA')
                      .id('atelierAAA')
                      .child(S.document().schemaType('atelierAAA').documentId('atelierAAA')),
                    S.listItem()
                      .title('Atelier Pinguin')
                      .id('pinguin')
                      .child(S.document().schemaType('pinguin').documentId('pinguin')),
                    S.listItem()
                      .title('Impressum')
                      .id('imprint')
                      .child(S.document().schemaType('imprint').documentId('imprint')),
                  ])
              ),
            S.divider(),
            
            // --- CONTENT ---
            S.listItem()
              .title('Programm & Content')
              .child(
                S.list()
                  .title('Programm & Content')
                  .items([
                    S.documentTypeListItem('event').title('Events'),
                    S.documentTypeListItem('workshop').title('Workshops'),
                    S.documentTypeListItem('artist').title('Artists'),
                    S.documentTypeListItem('membership').title('Memberships'),
                  ])
              ),
            
            // --- PARTNERS ---
            S.listItem()
              .title('Partner & Förderer')
              .child(
                S.list()
                  .title('Partner & Förderer')
                  .items([
                    S.listItem()
                      .title('Texte & Info')
                      .id('partnerTexts')
                      .child(S.document().schemaType('partnerTexts').documentId('partnerTexts')),
                    S.documentTypeListItem('fundingPartner').title('Fördergeber'),
                    S.documentTypeListItem('projectPartner').title('Projektpartner'),
                  ])
              ),

            // --- ATELIER AAA ---
            S.listItem()
              .title('Atelier AAA Details')
              .child(
                S.list()
                  .title('Atelier AAA Details')
                  .items([
                    S.listItem()
                      .title('Roland Adlassnigg')
                      .id('rolandAdlassnigg')
                      .child(S.document().schemaType('rolandAdlassnigg').documentId('rolandAdlassnigg')),
                    S.documentTypeListItem('institution').title('Institutionen'),
                    S.documentTypeListItem('productionArtist').title('Produktions-Künstler'),
                  ])
              ),

            S.divider(),

            // --- TEAM ---
            S.listItem()
              .title('Team')
              .child(
                S.list()
                  .title('Team')
                  .items([
                    S.documentTypeListItem('pinguinteam').title('Pinguin Team'),
                    S.documentTypeListItem('staff').title('Halle 5 Staff'),
                  ])
              ),

            // --- ADMINISTRATION ---
            S.listItem()
              .title('Administration')
              .child(
                S.list()
                  .title('Administration')
                  .items([
                    S.documentTypeListItem('visitor').title('Besucher:innen (DSVGO)'),
                  ])
              ),
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
