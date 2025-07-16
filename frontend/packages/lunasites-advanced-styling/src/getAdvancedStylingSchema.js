import { defaultStylingProperties } from './defaultStylingProperties';

export const getAdvancedStylingSchema = (intl) => ({
  title: 'Advanced styling',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'backgroundColor',
        'textColor',
        'textAlign',
        'fontSize',
        'fontWeight',
        'height',
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
