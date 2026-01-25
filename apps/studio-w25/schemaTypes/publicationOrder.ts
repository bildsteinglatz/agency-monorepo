import { defineType } from 'sanity';

export default defineType({
    name: 'publicationOrder',
    title: 'Publication Order',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Publication Order',
            readOnly: true,
            hidden: true,
        },
        {
            name: 'orderedPublications',
            title: 'Ordered Publications',
            type: 'array',
            description: 'Drag and drop publications to change their order on the website.',
            of: [{ type: 'reference', to: [{ type: 'publication' }] }],
        },
    ],
    preview: {
        prepare() {
            return {
                title: 'Publication Order Configuration',
            };
        },
    },
});
