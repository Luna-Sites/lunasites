import React from 'react';
import ObjectListWidget from '@plone/volto/components/manage/Widgets/ObjectListWidget';

const toolsLinkSchema = {
  title: 'Tools Link',
  addMessage: 'Add tools link',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title', 'href'],
    },
  ],
  properties: {
    title: {
      title: 'Title',
    },
    href: {
      title: 'URL',
      widget: 'url',
    },
  },
  required: [],
};

const ToolsHeaderField = (props) => {
  const { id, value = [], onChange } = props;

  return (
    <ObjectListWidget
      id={id}
      value={value}
      onChange={onChange}
      schema={toolsLinkSchema}
      {...props}
    />
  );
};

export default ToolsHeaderField;