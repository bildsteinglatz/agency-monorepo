import { defineType } from 'sanity';

export default defineType({
  name: 'categoryType',
  title: 'Kategorie-Typ',
  description: 'Hauptkategorien für die Navigation (z.B. Medium, Serie, etc.)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name (English)',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'English name for code/API',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      description: 'Unique slug for referencing this category type',
      validation: Rule => Rule.required(),
    },
    {
      name: 'title',
      title: 'Titel (Deutsch)',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'German title for display',
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      description: 'Description of this category type',
    },
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Order for navigation display',
      initialValue: 0,
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
      description: 'Control whether this category type is displayed on the frontend website',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'name',
    },
  }
});
