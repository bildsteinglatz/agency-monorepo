export default {
  name: 'textDocument',
  title: 'Text',
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
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string'
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 10,
      description: 'Use double line breaks (Enter twice) to create new paragraphs'
    },
    {
      name: 'textContent',
      title: 'Text Content (Alternative)',
      type: 'text',
      rows: 20,
      description: 'Use this field for longer text content. It will be used if Body is empty.'
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'originalPdf',
      title: 'Original PDF',
      type: 'file',
      options: {
        accept: '.pdf'
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      publishedAt: 'publishedAt'
    },
    prepare({ title, publishedAt }: { title: string, publishedAt: string }) {
      return {
        title,
        subtitle: publishedAt 
          ? new Date(publishedAt).toLocaleDateString() 
          : 'No publication date'
      }
    }
  }
}
