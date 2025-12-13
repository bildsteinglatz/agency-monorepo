export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'categoryType',
      title: 'Category Type',
      type: 'reference',
      to: [{ type: 'categoryType' }],
      validation: (Rule: any) => Rule.required(),
      description: 'Links this category to a type (year, field of art, body of work, etc.)'
    },
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Optional ordering for categories'
    }
  ],
  preview: {
    select: {
      title: 'title',
      categoryType: 'categoryType.title'
    },
    prepare({ title, categoryType }: { title: any; categoryType: any }) {
      return {
        title,
        subtitle: categoryType
      }
    }
  }
}
