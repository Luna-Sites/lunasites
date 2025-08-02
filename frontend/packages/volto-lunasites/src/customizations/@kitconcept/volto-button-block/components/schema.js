import { defineMessages } from 'react-intl';

const messages = defineMessages({
  ButtonBlock: {
    id: 'Button Block',
    defaultMessage: 'Button',
  },
  ButtonTitle: {
    id: 'Title',
    defaultMessage: 'Title',
  },
  ButtonLink: {
    id: 'Link',
    defaultMessage: 'Link',
  },
  Align: {
    id: 'Alignment',
    defaultMessage: 'Alignment',
  },
  innerAlign: {
    id: ' Inner Alignment',
    defaultMessage: 'Inner Alignment',
  },
  openLinkInNewTab: {
    id: 'Open in a new tab',
    defaultMessage: 'Open in a new tab',
  },
  // New size-related messages
  ButtonSize: {
    id: 'Button Size',
    defaultMessage: 'Button Size',
  },
  FontSize: {
    id: 'Font Size (px)',
    defaultMessage: 'Font Size (px)',
  },
  Padding: {
    id: 'Padding (px)',
    defaultMessage: 'Padding (px)',
  },
  ButtonWidth: {
    id: 'Button Width',
    defaultMessage: 'Button Width',
  },
});

export const ButtonSchema = (props) => {
  const { intl } = props;

  return {
    title: intl.formatMessage(messages.ButtonBlock),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['title', 'href', 'openLinkInNewTab', 'inneralign'],
      },
      {
        id: 'appearance',
        title: intl.formatMessage(messages.ButtonSize),
        fields: ['fontSize', 'padding', 'buttonWidth'],
      },
    ],

    properties: {
      title: {
        title: props.intl.formatMessage(messages.ButtonTitle),
      },
      href: {
        title: props.intl.formatMessage(messages.ButtonLink),
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description', 'hasPreviewImage'],
        allowExternals: true,
      },
      inneralign: {
        title: props.intl.formatMessage(messages.innerAlign),
        widget: 'inner_align',
        default: 'left',
      },
      openLinkInNewTab: {
        title: intl.formatMessage(messages.openLinkInNewTab),
        type: 'boolean',
      },
      // New size properties
      fontSize: {
        title: intl.formatMessage(messages.FontSize),
        type: 'number',
        minimum: 10,
        maximum: 72,
        default: 16,
        description: 'Font size in pixels (10-72px)',
      },
      padding: {
        title: intl.formatMessage(messages.Padding),
        type: 'number',
        minimum: 4,
        maximum: 40,
        default: 12,
        description: 'Button padding in pixels (4-40px)',
      },
      buttonWidth: {
        title: intl.formatMessage(messages.ButtonWidth),
        type: 'string',
        default: 'auto',
        description: 'Button width (e.g., "auto", "120px", "50%")',
      },
    },
    required: [],
  };
};