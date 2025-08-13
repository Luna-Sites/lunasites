import { defaultStylingProperties } from './defaultStylingProperties';

export const getAdvancedStylingSchema = (intl) => ({
  title: 'Advanced styling',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'backgroundPosition',
        'backgroundColor',
        'textColor',
        'textAlign',
        'fontSize',
        'fontWeight',
        'height',
        'isScreenHeight',
        'smoothScroll',
        'noGap',
        'width',
        'margin',
        'padding',
        'borderRadius',
        'shadowDepth',
        'shadowColor',
        'customCSS',
        'customClass',
        'customId',
        'hidden',
      ],
    },
  ],
  properties: defaultStylingProperties(intl),
});
