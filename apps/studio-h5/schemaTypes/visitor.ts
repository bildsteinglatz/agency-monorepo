import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'visitor',
  title: 'Besucher:innen',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Name' }),
    defineField({ name: 'email', type: 'string', title: 'Email' }),
    defineField({ name: 'address', type: 'text', title: 'Adresse' }),
    defineField({ name: 'dsvgoAccepted', type: 'boolean', title: 'DSVGO akzeptiert', initialValue: false }),
    defineField({ name: 'newsletterSubscribed', type: 'boolean', title: 'Newsletter abonniert', initialValue: false }),
    defineField({ name: 'emailSent', type: 'boolean', title: 'Bestätigungs-Email gesendet', initialValue: false }),
    defineField({ name: 'registrationDate', type: 'datetime', title: 'Registrierungsdatum', initialValue: () => new Date().toISOString() }),
  ],
})
