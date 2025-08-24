import { defineMessages } from 'react-intl';

const messages = defineMessages({
  cardsGrid: {
    id: 'Cards Grid',
    defaultMessage: 'Cards Grid',
  },
  headline: {
    id: 'Headline',
    defaultMessage: 'Headline',
  },
  columns: {
    id: 'Columns',
    defaultMessage: 'Columns',
  },
  variation: {
    id: 'Variation',
    defaultMessage: 'Variation',
  },
  cards: {
    id: 'Cards',
    defaultMessage: 'Cards',
  },
  cardTitle: {
    id: 'Title',
    defaultMessage: 'Title',
  },
  cardDescription: {
    id: 'Description',
    defaultMessage: 'Description',
  },
  cardImage: {
    id: 'Image',
    defaultMessage: 'Image',
  },
  cardLink: {
    id: 'Link',
    defaultMessage: 'Link',
  },
  cardLinkText: {
    id: 'Link Text',
    defaultMessage: 'Link Text',
  },
  iconGrid: {
    id: 'Icon Grid',
    defaultMessage: 'Icon Grid',
  },
  cardGrid: {
    id: 'Card Grid',
    defaultMessage: 'Card Grid',
  },
  cardSize: {
    id: 'Card Size',
    defaultMessage: 'Card Size',
  },
  small: {
    id: 'Small',
    defaultMessage: 'Small',
  },
  medium: {
    id: 'Medium',
    defaultMessage: 'Medium',
  },
  large: {
    id: 'Large',
    defaultMessage: 'Large',
  },
  iconLayout: {
    id: 'Icon Layout',
    defaultMessage: 'Icon Layout',
  },
  centered: {
    id: 'Centered',
    defaultMessage: 'Centered',
  },
  leftRight: {
    id: 'Left-Right',
    defaultMessage: 'Left-Right',
  },
  removeBackground: {
    id: 'Remove background',
    defaultMessage: 'Remove background',
  },
});

export const CardsGridSchema = (props) => {
  const { intl, data = {} } = props;

  const fields = ['headline', 'variation', 'columns', 'cardSize'];
  
  // Add iconLayout and removeBackground fields only when variation is 'icon'
  if (data.variation === 'icon') {
    fields.push('iconLayout');
    fields.push('removeBackground');
  }

  return {
    title: intl.formatMessage(messages.cardsGrid),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: fields,
      },
      {
        id: 'cards',
        title: intl.formatMessage(messages.cards),
        fields: ['cards'],
      },
    ],
    properties: {
      headline: {
        title: intl.formatMessage(messages.headline),
        type: 'string',
      },
      variation: {
        title: intl.formatMessage(messages.variation),
        type: 'string',
        choices: [
          ['card', intl.formatMessage(messages.cardGrid)],
          ['icon', intl.formatMessage(messages.iconGrid)],
        ],
        default: 'card',
      },
      columns: {
        title: intl.formatMessage(messages.columns),
        type: 'number',
        minimum: 1,
        maximum: 8,
        default: 4,
      },
      cardSize: {
        title: intl.formatMessage(messages.cardSize),
        type: 'string',
        choices: [
          ['small', intl.formatMessage(messages.small)],
          ['medium', intl.formatMessage(messages.medium)],
          ['large', intl.formatMessage(messages.large)],
        ],
        default: 'large',
      },
      iconLayout: {
        title: intl.formatMessage(messages.iconLayout),
        type: 'string',
        choices: [
          ['centered', intl.formatMessage(messages.centered)],
          ['left-right', intl.formatMessage(messages.leftRight)],
        ],
        default: 'centered',
      },
      removeBackground: {
        title: intl.formatMessage(messages.removeBackground),
        type: 'boolean',
        default: false,
      },
      cards: {
        title: intl.formatMessage(messages.cards),
        type: 'array',
        widget: 'object_list',
        schema: {
          title: 'Card',
          fieldsets: [
            {
              id: 'default',
              title: 'Default',
              fields: ['title', 'description', 'image', 'link', 'linkText'],
            },
          ],
          properties: {
            title: {
              title: intl.formatMessage(messages.cardTitle),
              type: 'string',
            },
            description: {
              title: intl.formatMessage(messages.cardDescription),
              widget: 'textarea',
              type: 'string',
            },
            image: {
              title: intl.formatMessage(messages.cardImage),
              widget: 'simple_image',
              description: 'Upload or enter image URL (use smaller images for icon grid)',
            },
            link: {
              title: intl.formatMessage(messages.cardLink),
              widget: 'object_browser',
              mode: 'link',
              allowExternals: true,
            },
            linkText: {
              title: intl.formatMessage(messages.cardLinkText),
              type: 'string',
            },
          },
          required: [],
        },
      },
    },
    required: [],
  };
};