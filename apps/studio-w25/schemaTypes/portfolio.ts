import { defineType } from 'sanity';

export default defineType({
    name: 'portfolio',
    title: 'Portfolio',
    type: 'document',
    groups: [
        { name: 'cover', title: 'Cover Page' },
        { name: 'content', title: 'Content' },
        { name: 'cv', title: 'CV' },
    ],
    fields: [
        {
            name: 'title',
            title: 'Internal Title',
            type: 'string',
            validation: Rule => Rule.required(),
            group: 'cover',
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title' },
            validation: Rule => Rule.required(),
            group: 'cover',
        },
        // Cover Page
        {
            name: 'coverTitle',
            title: 'Cover Title',
            type: 'string',
            description: 'Main title on the cover (e.g., Social Sculpture In Practice)',
            group: 'cover',
        },
        {
            name: 'coverSubtitle',
            title: 'Cover Subtitle',
            type: 'text',
            rows: 3,
            description: 'Subtitle/Description (e.g., Designing Multi-Modal Support...)',
            group: 'cover',
        },
        {
            name: 'submissionYear',
            title: 'Submission Year',
            type: 'string',
            initialValue: '2026',
            group: 'cover',
        },
        {
            name: 'candidateName',
            title: 'Candidate Name',
            type: 'string',
            initialValue: 'Matthias Bildstein',
            group: 'cover',
        },
        {
            name: 'candidateDegrees',
            title: 'Candidate Degrees',
            type: 'string',
            initialValue: 'Mag. (FH), Mag. art.',
            group: 'cover',
        },
        {
            name: 'targetDegree',
            title: 'Target Degree',
            type: 'string',
            initialValue: 'PhD in Art (Künstlerische Forschung)',
            group: 'cover',
        },
        {
            name: 'university',
            title: 'University',
            type: 'string',
            initialValue: 'University of Applied Arts Vienna',
            group: 'cover',
        },
        // Content
        {
            name: 'artistStatement',
            title: 'Artist Statement',
            type: 'array',
            of: [{ type: 'block' }],
            group: 'content',
        },
        {
            name: 'projects',
            title: 'Projects',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'projectEntry',
                    title: 'Project Entry',
                    fields: [
                        {
                            name: 'categoryTitle',
                            title: 'Slide Title / Category',
                            type: 'string',
                            description: 'e.g., "Cat. A: Systemic Scale"',
                            validation: Rule => Rule.required(),
                        },
                        {
                            name: 'artwork',
                            title: 'Artwork Reference',
                            type: 'reference',
                            to: [{ type: 'artwork' }],
                        },
                        {
                            name: 'customTitle',
                            title: 'Custom Title Override',
                            type: 'string',
                            description: 'Override the artwork title if needed (e.g. "Microdrome / Rethikus")',
                        },
                        {
                            name: 'iterationText',
                            title: 'Iteration / Meta',
                            type: 'string',
                            description: 'e.g. "Iteration: Monumental Installation // 2012-2024"',
                        },
                        {
                            name: 'description',
                            title: 'Description',
                            type: 'text',
                            description: 'Specific text for this portfolio entry',
                        },
                        {
                            name: 'matrixLabel',
                            title: 'Matrix Label',
                            type: 'string',
                            initialValue: 'RESEARCH MATRIX: MATERIAL -> OPERATION -> INSIGHT',
                        },
                        {
                            name: 'matrixContent',
                            title: 'Matrix Content',
                            type: 'text',
                            rows: 2,
                            description: 'The content inside the matrix box',
                        },
                        {
                            name: 'useBWFilter',
                            title: 'Use B/W Filter',
                            type: 'boolean',
                            initialValue: false,
                            description: 'Apply grayscale and contrast filter to image',
                        }
                    ],
                    preview: {
                        select: {
                            title: 'categoryTitle',
                            subtitle: 'artwork.title',
                            media: 'artwork.mainImage',
                        }
                    }
                }
            ],
            group: 'content',
        },
        // CV
        {
            name: 'cvSections',
            title: 'CV Sections',
            type: 'array',
            of: [
                {
                    type: 'object',
                    title: 'CV Section',
                    fields: [
                        {
                            name: 'title',
                            title: 'Section Title',
                            type: 'string',
                            description: 'e.g., Professional Practice',
                        },
                        {
                            name: 'entries',
                            title: 'Entries',
                            type: 'array',
                            of: [
                                {
                                    type: 'object',
                                    fields: [
                                        { name: 'year', title: 'Year/Period', type: 'string' },
                                        { name: 'title', title: 'Role/Title', type: 'string', description: 'Bold text' },
                                        { name: 'description', title: 'Description', type: 'string' },
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            group: 'cv',
        }
    ]
});
