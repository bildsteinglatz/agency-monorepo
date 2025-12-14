import {defineType} from 'sanity';

export default defineType({
  name: 'imageWithColor',
  title: 'Image (with Dominant Color)',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
      ],
    },
    {
      name: 'dominantColor',
      title: 'Dominant Color',
      type: 'string',
      description: 'Hex color like #RRGGBB. Filled automatically by the Studio component.',
      readOnly: true,
    },
    {
      name: 'dominantHue',
      title: 'Dominant Hue',
      type: 'number',
      description: 'Numeric hue (0-360) computed from the dominant color. Useful for sorting.',
      readOnly: true,
    },
    {
      name: 'dominantCategory',
      title: 'Dominant Color Category',
      type: 'string',
      description: 'Human-friendly category used for rainbow ordering (e.g. white, yellow, green, ...).',
      readOnly: true,
    },
    {
      name: 'dominantOrder',
      title: 'Dominant Color Order',
      type: 'number',
      description: 'Numeric sort order for rainbow ordering. Lower = earlier in rainbow.',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      image: 'image',
      color: 'dominantColor',
    },
    prepare(selection) {
      const {image, color} = selection;
      return {
        title: color || 'No dominant color',
        media: image,
      };
    },
  },
});
