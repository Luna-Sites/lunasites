import { defineMessages } from 'react-intl';

const messages = defineMessages({
  timelineBlockTitle: {
    id: 'timelineBlock',
    defaultMessage: 'Timeline block',
  },
  reversedTitle: {
    id: 'reversedTitle',
    defaultMessage: 'Reversed',
  },
  hideTimeTitle: {
    id: 'hideTime',
    defaultMessage: 'Hide time',
  },
  hideDateTitle: {
    id: 'hideDate',
    defaultMessage: 'Hide date completely',
  },
  compactTitle: {
    id: 'compact',
    defaultMessage: 'Compact view',
  },
  showTagsTitle: {
    id: 'showTags',
    defaultMessage: 'Show tags',
  },
  verticalTitle: {
    id: 'vertical',
    defaultMessage: 'Vertical layout',
  },
  showConnectorTitle: {
    id: 'showConnector',
    defaultMessage: 'Show connector lines',
  },
  autoMarkCompletedTitle: {
    id: 'autoMarkCompleted',
    defaultMessage: 'Mark completed dates',
  },
  schedulerTypeTitle: {
    id: 'schedulerType',
    defaultMessage: 'Scheduler view type',
  },
  currentDateTitle: {
    id: 'currentDate',
    defaultMessage: 'Current date/period',
  },
  startDateTitle: {
    id: 'startDate',
    defaultMessage: 'Start date',
  },
  endDateTitle: {
    id: 'endDate',
    defaultMessage: 'End date',
  },
  startHourTitle: {
    id: 'startHour',
    defaultMessage: 'Start hour',
  },
  endHourTitle: {
    id: 'endHour',
    defaultMessage: 'End hour',
  },
  weeklyStartDateTitle: {
    id: 'weeklyStartDate',
    defaultMessage: 'Weekly start date',
  },
  weeklyEndDateTitle: {
    id: 'weeklyEndDate',
    defaultMessage: 'Weekly end date',
  },
  monthlyStartDateTitle: {
    id: 'monthlyStartDate',
    defaultMessage: 'Monthly start date',
  },
  monthlyEndDateTitle: {
    id: 'monthlyEndDate',
    defaultMessage: 'Monthly end date',
  },
  timelineItemsTitle: {
    id: 'timelineItems',
    defaultMessage: 'Timeline items',
  },
  timelineItemTitle: {
    id: 'timelineItem',
    defaultMessage: 'Timeline item',
  },
  dateTimeTitle: {
    id: 'dateAndTime',
    defaultMessage: 'Date and time',
  },
  title: {
    id: 'title',
    defaultMessage: 'Title',
  },
  descriptionTitle: {
    id: 'timelineItemDescription',
    defaultMessage: 'Description',
  },
  iconTitle: {
    id: 'icon',
    defaultMessage: 'Icon',
  },
  iconDescription: {
    id: 'iconDescription',
    defaultMessage: 'Check here for a list with all the icons',
  },
  imageTitle: {
    id: 'timelineImage',
    defaultMessage: 'Image',
  },
  tagsTitle: {
    id: 'timelineTags',
    defaultMessage: 'Tags',
  },
  colorTitle: {
    id: 'timelineColor',
    defaultMessage: 'Color',
  },
  colorRed: {
    id: 'timelineItem.color.red',
    defaultMessage: 'Red',
  },
  colorOrange: {
    id: 'timelineItem.color.orange',
    defaultMessage: 'Orange',
  },
  colorYellow: {
    id: 'timelineItem.color.yellow',
    defaultMessage: 'Yellow',
  },
  colorOlive: {
    id: 'timelineItem.color.olive',
    defaultMessage: 'Olive',
  },
  colorGreen: {
    id: 'timelineItem.color.green',
    defaultMessage: 'Green',
  },
  colorTeal: {
    id: 'timelineItem.color.teal',
    defaultMessage: 'Teal',
  },
  colorBlue: {
    id: 'timelineItem.color.blue',
    defaultMessage: 'Blue',
  },
  colorViolet: {
    id: 'timelineItem.color.violet',
    defaultMessage: 'Violet',
  },
  colorPurple: {
    id: 'timelineItem.color.purple',
    defaultMessage: 'Purple',
  },
  colorPink: {
    id: 'timelineItem.color.pink',
    defaultMessage: 'Pink',
  },
  colorBrown: {
    id: 'timelineItem.color.brown',
    defaultMessage: 'Brown',
  },
  colorGrey: {
    id: 'timelineItem.color.grey',
    defaultMessage: 'Grey',
  },
  colorBlack: {
    id: 'timelineItem.color.black',
    defaultMessage: 'Black',
  },
});

const timelineSchema = (intl) => ({
  title: intl.formatMessage(messages.timelineItemTitle),
  fieldsets: [
    {
      id: 'default',
      title: intl.formatMessage(messages.timelineItemTitle),
      fields: ['datetime', 'title', 'description', 'icon', 'image', 'tags', 'color'],
    },
  ],
  properties: {
    datetime: {
      title: intl.formatMessage(messages.dateTimeTitle),
      widget: 'datetime',
    },
    title: {
      title: intl.formatMessage(messages.title),
    },
    description: {
      title: intl.formatMessage(messages.descriptionTitle),
    },
    icon: {
      title: intl.formatMessage(messages.iconTitle),
      widget: 'simple_icon_picker',
      description: 'Select an icon from the available RemixIcon collection',
    },
    image: {
      title: intl.formatMessage(messages.imageTitle),
      widget: 'url',
    },
    tags: {
      title: intl.formatMessage(messages.tagsTitle),
      type: 'array',
      items: {
        type: 'string',
      },
    },
    color: {
      title: intl.formatMessage(messages.colorTitle),
      defaultValue: 'blue',
      choices: [
        ['red', intl.formatMessage(messages.colorRed)],
        ['orange', intl.formatMessage(messages.colorOrange)],
        ['yellow', intl.formatMessage(messages.colorYellow)],
        ['olive', intl.formatMessage(messages.colorOlive)],
        ['green', intl.formatMessage(messages.colorGreen)],
        ['teal', intl.formatMessage(messages.colorTeal)],
        ['blue', intl.formatMessage(messages.colorBlue)],
        ['violet', intl.formatMessage(messages.colorViolet)],
        ['purple', intl.formatMessage(messages.colorPurple)],
        ['pink', intl.formatMessage(messages.colorPink)],
        ['brown', intl.formatMessage(messages.colorBrown)],
        ['grey', intl.formatMessage(messages.colorGrey)],
        ['black', intl.formatMessage(messages.colorBlack)],
      ],
    },
  },
  required: [],
});

const schema = (intl) => ({
  title: intl.formatMessage(messages.timelineBlockTitle),

  fieldsets: [
    {
      id: 'default',
      title: intl.formatMessage(messages.timelineBlockTitle),
      fields: ['reversed', 'hideTime', 'hideDate', 'compact', 'showTags', 'items'],
    },
  ],

  properties: {
    reversed: {
      title: intl.formatMessage(messages.reversedTitle),
      type: 'boolean',
    },
    hideTime: {
      title: intl.formatMessage(messages.hideTimeTitle),
      type: 'boolean',
    },
    hideDate: {
      title: intl.formatMessage(messages.hideDateTitle),
      type: 'boolean',
      description: 'When enabled, no date will be displayed at all',
    },
    compact: {
      title: intl.formatMessage(messages.compactTitle),
      type: 'boolean',
      description: 'Use a more compact layout for the timeline',
    },
    showTags: {
      title: intl.formatMessage(messages.showTagsTitle),
      type: 'boolean',
      description: 'Display tags for timeline items',
    },
    vertical: {
      title: intl.formatMessage(messages.verticalTitle),
      type: 'boolean',
      description: 'Display steps vertically (only for Steps variation)',
    },
    showConnector: {
      title: intl.formatMessage(messages.showConnectorTitle),
      type: 'boolean',
      description: 'Show connecting lines between steps (only for Steps variation)',
    },
    autoMarkCompleted: {
      title: intl.formatMessage(messages.autoMarkCompletedTitle),
      type: 'boolean',
      description: 'Automatically mark steps as completed based on past dates (only for Steps variation)',
    },
    schedulerType: {
      title: intl.formatMessage(messages.schedulerTypeTitle),
      type: 'string',
      choices: [
        ['weekly', 'Weekly View'],
        ['daily', 'Daily View'],
        ['monthly', 'Monthly View'],
      ],
      default: 'weekly',
      description: 'Choose how to display the scheduler (only for Scheduler variation)',
    },
    currentDate: {
      title: intl.formatMessage(messages.currentDateTitle),
      widget: 'datetime',
      description: 'Set the reference date for the scheduler view (only for Scheduler variation)',
    },
    startDate: {
      title: intl.formatMessage(messages.startDateTitle),
      widget: 'datetime',
      description: 'Set the start date for custom scheduler range (only for Scheduler variation)',
    },
    endDate: {
      title: intl.formatMessage(messages.endDateTitle),
      widget: 'datetime',
      description: 'Set the end date for custom scheduler range (only for Scheduler variation)',
    },
    startHour: {
      title: intl.formatMessage(messages.startHourTitle),
      type: 'number',
      minimum: 0,
      maximum: 23,
      default: 0,
      description: 'Start hour for daily view (0-23, only for Daily view)',
    },
    endHour: {
      title: intl.formatMessage(messages.endHourTitle),
      type: 'number',
      minimum: 0,
      maximum: 23,
      default: 23,
      description: 'End hour for daily view (0-23, only for Daily view)',
    },
    weeklyStartDate: {
      title: intl.formatMessage(messages.weeklyStartDateTitle),
      widget: 'datetime',
      description: 'Start date for weekly view (default: Sunday of current week)',
    },
    weeklyEndDate: {
      title: intl.formatMessage(messages.weeklyEndDateTitle),
      widget: 'datetime',
      description: 'End date for weekly view (default: Saturday of current week)',
    },
    monthlyStartDate: {
      title: intl.formatMessage(messages.monthlyStartDateTitle),
      widget: 'datetime',
      description: 'Start date for monthly view (default: first day of month)',
    },
    monthlyEndDate: {
      title: intl.formatMessage(messages.monthlyEndDateTitle),
      widget: 'datetime',
      description: 'End date for monthly view (default: last day of month)',
    },
    items: {
      title: intl.formatMessage(messages.timelineItemsTitle),
      widget: 'object_list',
      schema: timelineSchema(intl),
    },
  },

  required: [],
});

export default schema;