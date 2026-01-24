import { defineType } from 'sanity';

export default defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Important for SEO and accessibility',
        },
      ],
      validation: Rule => Rule.custom((mainImage, context) => {
        // Accept both the new `url` field and the legacy `vimeoUrl` for safety
        const vimeoVideo = (context.parent as { vimeoVideo?: { url?: string; vimeoUrl?: string } }).vimeoVideo;
        const vimeoUrl = vimeoVideo?.url || vimeoVideo?.vimeoUrl;
        if (!mainImage && !vimeoUrl) {
          return 'Either Main Image or Main Vimeo Video is required.';
        }
        return true;
      }),
    },
    {
      name: 'vimeoVideo',
      title: 'Main Vimeo Video',
      type: 'object',
      fields: [
        {
          // use `url` to match the content-level vimeo block and be consistent
          name: 'url',
          title: 'Vimeo URL',
          type: 'url',
          description: 'Paste the full Vimeo video link here',
        }
      ],
      description: 'Main Vimeo video for this artwork (required if no main image)',
    },
    {
      name: 'artist',
      title: 'Artist',
      type: 'reference',
      to: [{ type: 'artist' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: Rule => Rule.min(1800).max(new Date().getFullYear()),
    },
    {
      name: 'size',
      title: 'Size',
      type: 'string',
      placeholder: 'e.g., 100 x 80 cm',
    },
    {
      name: 'technique',
      title: 'Technique',
      type: 'string',
    },
    {
      name: 'edition',
      title: 'Edition',
      type: 'string',
      placeholder: 'e.g., 1/10, AP, or unique',
    },
    {
      name: 'fieldOfArt',
      title: 'Field of Art',
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        filter: 'categoryType->slug.current == "field-of-art"'
      },
      description: 'Main art form category (optional)',
    },
    {
      name: 'bodyOfWork',
      title: 'Body of Work',
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        filter: 'categoryType->slug.current == "body-of-work"'
      },
      description: 'Series or collection this artwork belongs to (optional)',
    },
    {
      name: 'extraCategories',
      title: 'Extra Categories',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'category' }],
        options: {
          filter: 'categoryType->slug.current == "god-mode"'
        }
      }],
      description: 'Additional ways to classify this artwork (nice to have)',
    },
    {
      name: 'serialNumber',
      title: 'Serial Number',
      type: 'number', // Keep as number for now to avoid type conflicts
      validation: Rule => Rule.required(),
    },
    {
      name: 'gallery',
      title: 'Mixed Media Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true, // For responsive cropping
          },
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }
          ]
        },
        {
          name: 'vimeoVideo',
          title: 'Vimeo Video',
          type: 'object',
          fields: [
            {
              name: 'url',
              title: 'Vimeo URL',
              type: 'url',
              description: 'Paste the full Vimeo video link here',
            }
          ]
        }
      ]
    },
    {
      name: 'exhibitionHistory',
      title: 'Exhibition History',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'exhibition' }] }],
    },
    {
      name: 'literature',
      title: 'Literature / Publications',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'publication' }] }],
    },
    {
      name: 'price',
      title: 'Price',
      type: 'string',
    },
    {
      name: 'availability',
      title: 'Availability',
      type: 'string',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Sold', value: 'sold' },
          { title: 'Not for Sale', value: 'nfs' },
          { title: 'On Loan', value: 'loan' },
        ],
      },
    },
    {
      name: 'content',
      title: 'Content',
      description: 'Rich text description with images, files, and Vimeo video',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'file' },
        {
          name: 'vimeoVideo',
          title: 'Vimeo Video',
          type: 'object',
          fields: [
            {
              name: 'url',
              title: 'Vimeo URL',
              type: 'url',
              description: 'Paste the full Vimeo video link here',
            }
          ]
        }
      ]
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
    },
    {
      name: 'showOnWebsite',
      title: 'Show on Website',
      type: 'boolean',
      initialValue: false,
      description: 'Control whether this artwork is displayed publicly on the frontend website',
    },
    {
      name: 'layoutType',
      title: 'Layout Type',
      type: 'string',
      options: {
        list: [
          { title: 'Simple', value: 'simple' },
          { title: 'Extended', value: 'extended' },
        ],
        layout: 'radio'
      },
      initialValue: 'simple',
      description: 'Choose how this artwork should be displayed on the website',
    },
    {
      name: 'seo',
      title: 'SEO / Social Share',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'ogTitle',
          title: 'OG Title',
          type: 'string',
          description: 'Custom social title. Fallback: [Title] by Bildstein | Glatz',
        },
        {
          name: 'ogDescription',
          title: 'OG Description',
          type: 'text',
          rows: 3,
          description: 'Custom social description (limited to 160 chars). Fallback: First 60 characters of content.',
          validation: Rule => Rule.max(160),
        },
        {
          name: 'ogImage',
          title: 'OG Image',
          type: 'image',
          description: 'Specific image for social feeds (1200x630 recommended). Fallback: Main Image.',
        },
      ],
    },
    {
      name: 'dominantColorReview',
      title: 'Dominant Color (review)',
      type: 'object',
      description: 'Shows the automatically suggested dominant color and lets you override it if needed. Lowest priority field - appears at the bottom.',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: 'suggested',
          title: 'Suggested dominant color',
          type: 'string',
          description: 'Auto-extracted hex color (e.g. #a1b2c3). Populated from the image color extractor.',
          readOnly: true,
        },
        {
          name: 'override',
          title: 'Override dominant color',
          type: 'string',
          description: 'If set, this color (hex) will be used instead of the suggested color. Enter a hex value like #RRGGBB.',
          validation: Rule => Rule.optional().regex(/^#([0-9a-fA-F]{6})$/, { name: 'hex', invert: false }),
        }
      ]
    },
  ],
  preview: {
    select: {
      title: 'title',
      artist: 'artist.name',
      media: 'mainImage',
      yearNum: 'year', // Numeric year field
      fieldOfArt: 'fieldOfArt.title',
      bodyOfWork: 'bodyOfWork.title',
    },
    prepare(selection) {
      const { title, artist, yearNum, fieldOfArt, bodyOfWork, media } = selection;

      // Use numeric year field
      const yearDisplay = yearNum || 'Unknown Year';

      let subtitle = artist ? `${artist} (${yearDisplay})` : yearDisplay;

      if (fieldOfArt) {
        subtitle += ` | ${fieldOfArt}`;
      }

      if (bodyOfWork) {
        subtitle += ` | ${bodyOfWork}`;
      }

      return {
        title: title,
        subtitle: subtitle,
        media: media,
      };
    },
  },
});