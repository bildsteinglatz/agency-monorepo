export default {
  name: 'about',
  title: 'About',
  type: 'document',
  // Make it a singleton
  __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 20
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: true
    }
  ]
}
