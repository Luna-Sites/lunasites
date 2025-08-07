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
});

export const ScrollingBannerSchema = ({ intl }) => ({
  title: intl.formatMessage(messages.scrollingBanner),
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['items'],
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
