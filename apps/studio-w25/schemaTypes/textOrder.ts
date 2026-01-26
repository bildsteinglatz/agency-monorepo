import { defineType } from 'sanity';

export default defineType({
    name: 'textOrder',
    title: 'Text Order',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Text Order',
            readOnly: true,
            hidden: true,
        },
        {
            name: 'orderedTexts',
            title: 'Ordered Texts',
            type: 'array',
            description: 'Drag and drop texts to change their order on the website.',
            of: [{ type: 'reference', to: [{ type: 'textDocument' }] }],
        },
    ],
    preview: {
        prepare() {
            return {
                title: 'Text Order Configuration',
            };
        },
    },
});
