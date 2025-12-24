import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'partnerTexts',
  title: 'Partner & Förderer Texte',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'additionalInfo',
      title: 'Zusatzinformationen',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
