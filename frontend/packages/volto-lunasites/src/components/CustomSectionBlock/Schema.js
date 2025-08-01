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
});

export const CustomSectionBlockSchema = (props) => {
  return {
    title: props.intl.formatMessage(messages.CustomSectionBlock),
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['title'],
      },
    ],
    properties: {
      title: {
        title: 'Title',
        type: 'string',
      },
    },
    required: [],
  };
};

export default CustomSectionBlockSchema;