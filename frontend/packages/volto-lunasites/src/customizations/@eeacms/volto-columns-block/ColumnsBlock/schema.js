import { defineMessages } from 'react-intl';

const messages = defineMessages({
  labelColumn: {
    id: 'Column',
    defaultMessage: 'Column',
  },
  labelDefault: {
    id: 'Default',
    defaultMessage: 'Default',
  },
  labelColumnTitle: {
    id: 'Column title',
    defaultMessage: 'Column title',
  },
  labelColumnsBlock: {
    id: 'Columns block',
    defaultMessage: 'Columns block',
  },
  labelTitle: {
    id: 'Title',
    defaultMessage: 'Title',
  },
  descrTitle: {
    id: 'Columns block friendly name',
    defaultMessage: 'Columns block friendly name',
  },
  labelColumns: {
    id: 'Columns',
    defaultMessage: 'Columns',
  },
  labelLayout: {
    id: 'Layout',
    defaultMessage: 'Layout',
  },
  labelReverseWrap: {
    id: 'Reverse wrap',
    defaultMessage: 'Reverse wrap',
  },
  reverseWrapDescription: {
    id: 'reverseWrapDescription',
    defaultMessage: 'Reverse column order when opening site on mobile.',
  },
  column_verticalAlign: {
    id: 'Column vertical align',
    defaultMessage: 'Vertical align',
  },
  column_verticalAlign_top: {
    id: 'Top',
    defaultMessage: 'Top',
  },
  column_verticalAlign_middle: {
    id: 'Middle',
    defaultMessage: 'Middle',
  },
  column_verticalAlign_bottom: {
    id: 'Bottom',
    defaultMessage: 'Bottom',
  },
});

export const columnSchema = (intl) => {
  return {
    title: intl.formatMessage(messages.labelColumn),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.labelDefault),
        fields: ['title', 'grid_vertical_align'],
      },
    ],
    properties: {
      title: {
        title: intl.formatMessage(messages.labelColumnTitle),
      },
      grid_vertical_align: {
        title: intl.formatMessage(messages.column_verticalAlign),
        default: 'top',
        choices: [
          ['top', intl.formatMessage(messages.column_verticalAlign_top)],
          ['middle', intl.formatMessage(messages.column_verticalAlign_middle)],
          ['bottom', intl.formatMessage(messages.column_verticalAlign_bottom)],
        ],
      },
    },
    required: [],
  };
};

export const ColumnsBlockSchema = (props) => {
  const { intl, activeObject, setActiveObject } = props;
  return {
    title: intl.formatMessage(messages.labelColumnsBlock),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.labelDefault),
        fields: ['title', 'columns', 'gridCols', 'reverseWrap'],
      },
    ],
    properties: {
      title: {
        title: intl.formatMessage(messages.labelTitle),
        description: intl.formatMessage(messages.descrTitle),
        type: 'string',
      },
      columns: {
        widget: 'object_list',
        title: intl.formatMessage(messages.labelColumns),
        schema: columnSchema(intl),
        activeObject: activeObject,
        setActiveObject: setActiveObject,
      },
      gridCols: {
        title: intl.formatMessage(messages.labelLayout),
        widget: 'layout_select',
        choices: [],
      },
      reverseWrap: {
        title: intl.formatMessage(messages.labelReverseWrap),
        description: intl.formatMessage(messages.reverseWrapDescription),
        type: 'boolean',
      },
    },
    required: [],
  };
};
