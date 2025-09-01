import { defineMessages } from 'react-intl';

const messages = defineMessages({
  button: {
    id: 'Button',
    defaultMessage: 'Button',
  },
  type: {
    id: 'Type',
    defaultMessage: 'Type',
  },
  filled: {
    id: 'Filled',
    defaultMessage: 'Filled',
  },
  outline: {
    id: 'Outline',
    defaultMessage: 'Outline',
  },
  text: {
    id: 'Text',
    defaultMessage: 'Text',
  },
  color: {
    id: 'Color',
    defaultMessage: 'Color',
  },
  size: {
    id: 'Size',
    defaultMessage: 'Size',
  },
  width: {
    id: 'Width',
    defaultMessage: 'Width',
  },
  align: {
    id: 'Align',
    defaultMessage: 'Align',
  },
  link: {
    id: 'Link',
    defaultMessage: 'Link',
  },
  page: {
    id: 'Page',
    defaultMessage: 'Page',
  },
  url: {
    id: 'URL',
    defaultMessage: 'URL',
  },
  enterYourLink: {
    id: 'Enter your link',
    defaultMessage: 'Enter your link',
  },
  openInNewTab: {
    id: 'Open in a new tab',
    defaultMessage: 'Open in a new tab',
  },
  no: {
    id: 'No',
    defaultMessage: 'No',
  },
  yes: {
    id: 'Yes',
    defaultMessage: 'Yes',
  },
  advanced: {
    id: 'Advanced',
    defaultMessage: 'Advanced',
  },
});

export const ButtonSettingsSchema = (props) => {
  const { intl } = props;

  return {
    title: intl.formatMessage(messages.button),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['href', 'openInNewTab'],
      },
    ],
    properties: {
      href: {
        title: intl.formatMessage(messages.link),
        widget: 'object_browser',
        mode: 'link',
        selectedItemAttrs: ['Title', 'Description', 'hasPreviewImage'],
        allowExternals: true,
      },
      openInNewTab: {
        title: intl.formatMessage(messages.openInNewTab),
        type: 'boolean',
      },
      color: {
        title: intl.formatMessage(messages.color),
        widget: 'color_circles',
        choices: [
          ['primary', 'Primary'],
          ['secondary', 'Secondary'],
          ['tertiary', 'Tertiary'],
          ['warning', 'Warning'],
          ['white', 'White'],
          ['black', 'Black'],
        ],
        default: 'primary',
      },
      size: {
        title: intl.formatMessage(messages.size),
        widget: 'styled_select',
        choices: [
          ['xs', 'Extra Small'],
          ['s', 'Small'],
          ['m', 'Medium'],
          ['l', 'Large'],
          ['xl', 'Extra Large'],
        ],
        default: 'm',
      },
      align: {
        title: intl.formatMessage(messages.align),
        widget: 'styled_select',
        choices: [
          ['left', 'Left'],
          ['center', 'Center'],
          ['right', 'Right'],
        ],
        default: 'left',
      },
    },
    required: [],
  };
};

export const ButtonStylesSchema = (props) => {
  const { intl } = props;

  return {
    title: intl.formatMessage(messages.button),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['buttonType', 'color', 'size', 'align'],
      },
    ],
    properties: {
      buttonType: {
        title: intl.formatMessage(messages.type),
        widget: 'styled_select',
        choices: [
          ['filled', intl.formatMessage(messages.filled)],
          ['outline', 'Outline'],
          ['text', intl.formatMessage(messages.text)],
        ],
        default: 'filled',
      },
      color: {
        title: intl.formatMessage(messages.color),
        widget: 'color_circles',
        choices: [
          ['primary', 'Primary'],
          ['secondary', 'Secondary'],
          ['tertiary', 'Tertiary'],
          ['warning', 'Warning'],
          ['white', 'White'],
          ['black', 'Black'],
        ],
        default: 'primary',
      },
      size: {
        title: intl.formatMessage(messages.size),
        widget: 'styled_select',
        choices: [
          ['xs', 'Extra Small'],
          ['s', 'Small'],
          ['m', 'Medium'],
          ['l', 'Large'],
          ['xl', 'Extra Large'],
        ],
        default: 'm',
      },
      align: {
        title: intl.formatMessage(messages.align),
        widget: 'styled_select',
        choices: [
          ['left', 'Left'],
          ['center', 'Center'],
          ['right', 'Right'],
        ],
        default: 'left',
      },
    },
    required: [],
  };
};

// Keep the original schema for backward compatibility
export const ButtonSchema = ButtonSettingsSchema;
