import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'membership',
    title: 'Mitgliedschaften',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Membership Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
            description: 'e.g., "Halle 5 – Fan"',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
            },
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Private Mitgliedschaften', value: 'private' },
                    { title: 'Professionelle Partnerschaften', value: 'professional' },
                    { title: 'Förderung von Projekten', value: 'projects' },
                ],
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'priceLabel',
            title: 'Price Label',
            type: 'string',
            description: 'e.g., "90 €" or "auf Anfrage"',
        }),
        defineField({
            name: 'priceValue',
            title: 'Price Value (for sorting)',
            type: 'number',
            description: 'Numeric value used for sorting (e.g., 90). Use a high number for "on request".',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
            description: 'The subtext describing who this tier is for',
        }),
        defineField({
            name: 'benefits',
            title: 'Benefits',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'List of benefits for this membership',
        }),
        defineField({
            name: 'order',
            title: 'Display Order',
            type: 'number',
            description: 'Order within category (0 = first)',
        }),
        defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Tier', value: 'tier' },
                    { title: 'Project', value: 'project' },
                ],
            },
            initialValue: 'tier',
        }),
        defineField({
            name: 'ctaText',
            title: 'Call-to-Action Text',
            type: 'string',
            description: 'Button text, e.g., "Jetzt beitreten"',
        }),
        defineField({
            name: 'checkoutUrl',
            title: 'Checkout URL',
            type: 'url',
            description: 'Direct link to checkout (e.g., Stripe, PayPal)',
        }),
        defineField({
            name: 'showOnWebsite',
            title: 'Show on Website',
            type: 'boolean',
            initialValue: true,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            category: 'category',
            price: 'priceLabel',
        },
        prepare({ title, category, price }) {
            return {
                title: title,
                subtitle: `${category} - ${price}`,
            }
        },
    },
})
