import { defineMessages } from 'react-intl';

const messages = defineMessages({
  scrollingBanner: {
    id: 'Scrolling Banner',
    defaultMessage: 'Scrolling Banner',
  },
  items: {
    id: 'Banner Items',
    defaultMessage: 'Banner Items',
  },
  title: {
    id: 'Title',
    defaultMessage: 'Title',
  },
  description: {
    id: 'Description',
    defaultMessage: 'Description',
  },
  animationSpeed: {
    id: 'Animation Speed',
    defaultMessage: 'Animation Speed',
  },
  stickyBottom: {
    id: 'Sticky Bottom',
    defaultMessage: 'Sticky Bottom',
  },
  backgroundColor: {
    id: 'Background Color',
    defaultMessage: 'Background Color',
  },
  textColor: {
    id: 'Text Color',
    defaultMessage: 'Text Color',
  },
  settings: {
    id: 'Settings',
    defaultMessage: 'Settings',
  },
});

export const ScrollingBannerSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.scrollingBanner),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['items'],
    },
    {
      id: 'settings',
      title: intl.formatMessage(messages.settings),
      fields: [
        'animationSpeed',
        'stickyBottom',
        'backgroundColor',
        'textColor',
      ],
    },
  ],
  properties: {
    items: {
      title: intl.formatMessage(messages.items),
      widget: 'object_list',
      schema: {
        title: intl.formatMessage(messages.items),
        fieldsets: [
          {
            id: 'default',
            title: 'Default',
            fields: ['title', 'description'],
          },
        ],
        properties: {
          title: {
            title: intl.formatMessage(messages.title),
            type: 'string',
          },
          description: {
            title: intl.formatMessage(messages.description),
            type: 'string',
            widget: 'textarea',
          },
        },
        required: ['title'],
      },
    },
    animationSpeed: {
      title: intl.formatMessage(messages.animationSpeed),
      type: 'number',
      default: 3,
      minimum: 1,
      maximum: 10,
      description: 'Animation speed (higher = faster)',
    },
    stickyBottom: {
      title: intl.formatMessage(messages.stickyBottom),
      type: 'boolean',
      default: false,
      description: 'Keep banner always visible at bottom of screen',
    },
    backgroundColor: {
      title: intl.formatMessage(messages.backgroundColor),
      type: 'string',
      widget: 'simple_color_picker',
      default: '#ff0000',
      description: 'Background color of the banner',
      colors: [
        '#ff0000', // Red
        '#00ff00', // Green
        '#0000ff', // Blue
        '#ffff00', // Yellow
        '#ff8800', // Orange
        '#8800ff', // Purple
        '#00ffff', // Cyan
        '#ff00ff', // Magenta
        '#000000', // Black
        '#ffffff', // White
        '#808080', // Gray
        '#dc3545', // Bootstrap Danger
        '#28a745', // Bootstrap Success
        '#007bff', // Bootstrap Primary
        '#ffc107', // Bootstrap Warning
        '#17a2b8', // Bootstrap Info
      ],
    },
    textColor: {
      title: intl.formatMessage(messages.textColor),
      type: 'string',
      widget: 'simple_color_picker',
      default: '#ffffff',
      description: 'Text color of the banner',
      colors: [
        '#ffffff', // White
        '#000000', // Black
        '#ff0000', // Red
        '#00ff00', // Green
        '#0000ff', // Blue
        '#ffff00', // Yellow
        '#ff8800', // Orange
        '#8800ff', // Purple
        '#00ffff', // Cyan
        '#ff00ff', // Magenta
        '#808080', // Gray
        '#f8f9fa', // Light Gray
        '#343a40', // Dark Gray
        '#6c757d', // Medium Gray
        '#e9ecef', // Very Light Gray
        '#495057', // Darker Gray
      ],
    },
  },
  required: ['items'],
});

export const scrollingBannerSchemaEnhancer = ({ schema, formData, intl }) => {
  const customSchema = ScrollingBannerSchema({ intl });
  return {
    ...schema,
    ...customSchema,
  };
};
