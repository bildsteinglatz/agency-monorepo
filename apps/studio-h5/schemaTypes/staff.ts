import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'staff',
  title: 'Team / Staff',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Name' }),
    defineField({ name: 'email', type: 'string', title: 'Email' }),
    defineField({ 
      name: 'role', 
      type: 'string', 
      title: 'Rolle',
      options: {
        list: [
          { title: 'Admin', value: 'admin' },
          { title: 'Staff', value: 'staff' },
        ]
      }
    }),
  ],
})
