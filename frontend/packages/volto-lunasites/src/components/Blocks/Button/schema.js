import { defineMessages } from 'react-intl';

const messages = defineMessages({
  button: {
    id: 'Luna Button',
    defaultMessage: 'Luna Button',
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

export const ButtonSchema = (props) => {
  const { intl } = props;

  return {
    title: intl.formatMessage(messages.button),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['buttonType', 'color', 'size', 'width', 'align'],
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
        widget: 'color_list',
        colors: [
          { name: 'primary', label: 'Primary', color: '#007bb1' },
          { name: 'secondary', label: 'Secondary', color: '#ea5389' },
          { name: 'warning', label: 'Warning', color: '#ffc107' },
          { name: 'info', label: 'Info', color: '#17a2b8' },
        ],
        default: 'primary',
      },
      size: {
        title: intl.formatMessage(messages.size),
        widget: 'button_group',
        choices: [
          ['xs', 'XS'],
          ['s', 'S'],
          ['m', 'M'],
          ['l', 'L'],
          ['xl', 'XL'],
        ],
        default: 'm',
      },
      width: {
        title: intl.formatMessage(messages.width),
        widget: 'button_group',
        choices: [
          ['fit', 'Fit'],
          ['full', 'Full'],
        ],
        default: 'fit',
      },
      align: {
        title: intl.formatMessage(messages.align),
        widget: 'align',
        actions: ['left', 'center', 'right'],
        default: 'left',
      },
    },
    required: [],
  };
};
