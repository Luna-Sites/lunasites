import { defineMessages } from 'react-intl';

const messages = defineMessages({
  CustomSectionBlock: {
    id: 'Custom Section Block',
    defaultMessage: 'Custom Section Block',
  },
  backgroundColor: {
    id: 'Background color',
    defaultMessage: 'Background color',
  },
  layoutMode: {
    id: 'Layout Mode',
    defaultMessage: 'Layout Mode',
  },
  layoutModeDescription: {
    id: 'Choose how blocks are arranged in this section',
    defaultMessage: 'Choose how blocks are arranged in this section',
  },
  gridSettings: {
    id: 'Grid Settings',
    defaultMessage: 'Grid Settings',
  },
  showGridOverlay: {
    id: 'Show Grid Overlay',
    defaultMessage: 'Show Grid Overlay',
  },
  gridGap: {
    id: 'Grid Gap',
    defaultMessage: 'Grid Gap (pixels)',
  },
});

export const CustomSectionBlockSchema = (props) => {
  return {
    title: props.intl.formatMessage(messages.CustomSectionBlock),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['title', 'layout_mode'],
      },
      {
        id: 'grid_settings',
        title: props.intl.formatMessage(messages.gridSettings),
        fields: ['show_grid_overlay', 'grid_gap'],
      },
    ],
    properties: {
      title: {
        title: 'Title',
        type: 'string',
      },
      layout_mode: {
        title: props.intl.formatMessage(messages.layoutMode),
        description: props.intl.formatMessage(messages.layoutModeDescription),
        type: 'string',
        choices: [
          ['linear', 'Linear - Simple vertical stack'],
          ['freeform', 'Freeform - Free positioning (Legacy)'],
          ['grid', 'Grid - 12-column responsive grid'],
        ],
        default: 'grid',
      },
      show_grid_overlay: {
        title: props.intl.formatMessage(messages.showGridOverlay),
        description: 'Display grid lines in edit mode',
        type: 'boolean',
        default: true,
      },
      grid_gap: {
        title: props.intl.formatMessage(messages.gridGap),
        description: 'Space between grid cells',
        type: 'number',
        default: 16,
        minimum: 0,
        maximum: 40,
      },
    },
    required: [],
  };
};

export default CustomSectionBlockSchema;