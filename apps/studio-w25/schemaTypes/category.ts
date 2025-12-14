import { defineType } from 'sanity';

export default defineType({
  name: 'category',
  title: 'Kategorie',
  description: 'Kategorien für Kunstwerke, Texte und andere Dokumente',
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
      name: 'title',
      title: 'Titel (Deutsch)',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'German title for display',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      description: 'URL-friendly identifier for this category',
    },
    {
      name: 'categoryType',
      title: 'Kategorie-Typ',
      type: 'reference',
      to: [{ type: 'categoryType' }],
      validation: Rule => Rule.required(),
      description: 'Type of category for filtering and navigation',
    },
    {
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Optional parent category for hierarchical navigation',
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      description: 'Optional description of this category',
    },
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Order within category type',
      initialValue: 0,
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true,
      description: 'Control whether this category is displayed on the frontend website',
    },
    {
      name: "previewType",
      title: "Preview Type",
      type: "string",
      options: {
         list: [
           { title: "Grid", value: "grid" },
           { title: "List", value: "list" }
         ],
     layout: "radio"
    },
  initialValue: "grid"
},
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'name',
      categoryType: 'categoryType.title',
      parentTitle: 'parent.title',
    },
    prepare({ title, subtitle, categoryType, parentTitle }) {
      const parentInfo = parentTitle ? ` (Child of ${parentTitle})` : '';
      
      return {
        title: title,
        subtitle: `${categoryType || 'Category'} | ${subtitle}${parentInfo}`,
      };
    },
  }
});