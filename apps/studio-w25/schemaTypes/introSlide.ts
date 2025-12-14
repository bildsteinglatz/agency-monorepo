import { defineType } from 'sanity';

/**
 * Sanity Schema für einen einzelnen Intro-Karussell-Slide.
 * Dieser Typ sollte die Basis für die drei thematischen Slides (Öffentlicher Raum, Malerei, Relational)
 * sowie den optionalen End-Slide bilden.
 */
export default defineType({
  name: 'introSlide',
  title: 'Intro Karussell Slide',
  type: 'document',
  fields: [
    {
      name: 'statement',
      title: 'Kernaussage / Beschreibung',
      type: 'text',
      rows: 4, // Empfohlen für die Länge Ihrer Statements
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'backgroundWorkImage',
      title: 'Hintergrundbild des Werks',
      type: 'image',
      description: 'Ein hochauflösendes Bild, das den jeweiligen Themenbereich visuell unterstützt. Wird als Hintergrund im Overlay verwendet.',
      options: {
        hotspot: true, // Ermöglicht das Setzen des Fokuspunktes
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Sortierreihenfolge',
      type: 'number',
      description: 'Gibt die Position des Slides im Karussell an (1, 2, 3, 4...).',
      validation: (Rule) => Rule.required().integer().min(1),
    },
    {
      name: 'isFinalEntryScreen',
      title: 'Ist dies der finale Einstiegs-Screen?',
      type: 'boolean',
      description: 'Setzen Sie dies auf WAHR für den letzten Slide, der zum Betreten der Hauptseite auffordert.',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'statement',
      media: 'backgroundWorkImage',
    },
  },
});
