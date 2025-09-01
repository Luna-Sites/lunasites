import React from 'react';
import { BlockDataForm } from '@plone/volto/components';
import { ButtonSchema } from './schema';
import { useIntl } from 'react-intl';

const ButtonSidebar = (props) => {
  const { data, block, onChangeBlock, navRoot, contentType } = props;
  const intl = useIntl();
  const schema = ButtonSchema({ ...props, intl });

  return (
    <BlockDataForm
      schema={schema}
      title={schema.title}
      onChangeField={(id, value) => {
        onChangeBlock(block, {
          ...data,
          [id]: value,
        });
      }}
      onChangeBlock={onChangeBlock}
      formData={data}
      block={block}
      navRoot={navRoot}
      contentType={contentType}
    />
  );
};

export default ButtonSidebar;