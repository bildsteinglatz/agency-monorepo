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
            // --- SEITEN ---
            S.listItem()
              .title('Seiten')
              .id('seiten')
              .child(
                S.list()
                  .title('Seiten')
                  .id('seiten-list')
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
                      .title('Impressum & Dsvgo')
                      .id('imprint')
                      .child(S.document().schemaType('imprint').documentId('imprint')),
                    S.listItem()
                      .title('Texte & Info')
                      .id('partnerTexts')
                      .child(S.document().schemaType('partnerTexts').documentId('partnerTexts')),
                    S.listItem()
                      .title('Roland Adlassnigg')
                      .id('rolandAdlassnigg')
                      .child(S.document().schemaType('rolandAdlassnigg').documentId('rolandAdlassnigg')),
                  ])
              ),
            S.divider(),

            // --- PEOPLE & PARTNER ---
            S.listItem()
              .title('People & Partner')
              .id('people-partner')
              .child(
                S.list()
                  .title('People & Partner')
                  .id('people-partner-list')
                  .items([
                    S.documentTypeListItem('artist').title('Artists'),
                    S.documentTypeListItem('pinguinteam').title('Pinguin Team'),
                    S.documentTypeListItem('staff').title('Halle 5 Staff'),
                    S.documentTypeListItem('visitor').title('Users (DSVGO)'),
                    S.documentTypeListItem('productionArtist').title('AAA Artists'),
                    S.documentTypeListItem('fundingPartner').title('Fördergeber'),
                    S.documentTypeListItem('projectPartner').title('Projektpartner'),
                    S.documentTypeListItem('institution').title('Institutionen'),
                  ])
              ),
            S.divider(),

            // --- PRODUCTS ---
            S.listItem()
              .title('Products')
              .id('products')
              .child(
                S.list()
                  .title('Products')
                  .id('products-list')
                  .items([
                    S.listItem()
                      .title('Workshops')
                      .schemaType('workshop')
                      .child(
                        S.documentTypeList('workshop')
                          .title('Workshops')
                          .defaultOrdering([{field: 'order', direction: 'desc'}])
                      ),
                    S.documentTypeListItem('event').title('Events'),
                    S.documentTypeListItem('membership').title('Membership'),
                    S.listItem()
                      .title('Shop (upcoming)')
                      .id('shop-upcoming')
                      .child(
                        S.list()
                          .title('Shop (upcoming)')
                          .items([
                            S.listItem()
                              .id('shop-coming-soon')
                              .title('Shop coming soon')
                              .child(
                                S.document()
                                  .id('shop-placeholder')
                                  .title('Coming Soon')
                                  .schemaType('halle5Info')
                                  .documentId('shop-placeholder')
                              )
                          ])
                      ),
                  ])
              ),
            S.divider(),

            // --- ADMINISTRATION ---
            S.listItem()
              .title('Administration')
              .id('administration')
              .child(
                S.list()
                  .title('Administration')
                  .id('administration-list')
                  .items([
                    S.documentTypeListItem('emailTemplate').title('Email Templates'),
                    S.listItem()
                      .title('Accounting Receipts')
                      .child(
                        S.list()
                          .title('Accounting Receipts')
                          .items([
                            S.listItem()
                              .title('Drafts / Pending')
                              .child(
                                S.documentList()
                                  .title('Draft Receipts')
                                  .filter('_type == "accountingReceipt" && status != "processed"')
                              ),
                            S.listItem()
                              .title('Processed / Archived')
                              .child(
                                S.documentList()
                                  .title('Processed Receipts')
                                  .filter('_type == "accountingReceipt" && status == "processed"')
                              ),
                            S.divider(),
                            S.documentTypeListItem('accountingReceipt').title('All Receipts'),
                          ])
                      ),
                    S.documentTypeListItem('changelog').title('Changelog (Building Log)'),
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
