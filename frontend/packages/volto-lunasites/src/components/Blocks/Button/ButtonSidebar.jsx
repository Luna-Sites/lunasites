import React from 'react';
import { ButtonSettingsSchema, ButtonStylesSchema } from './schema';
import { useIntl } from 'react-intl';
import TabbedSidebar from '../../TabbedSidebar';

const ButtonSidebar = (props) => {
  const { 
    data, 
    block, 
    onChangeBlock, 
    onDeleteBlock,
    onSelectBlock,
    onDuplicateBlock,
    navRoot, 
    contentType 
  } = props;
  const intl = useIntl();
  const settingsSchema = ButtonSettingsSchema({ ...props, intl });
  const stylesSchema = ButtonStylesSchema({ ...props, intl });

  const handleDelete = () => {
    if (onDeleteBlock) {
      onDeleteBlock(block);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicateBlock) {
      onDuplicateBlock(block);
    }
  };

  const handleClose = () => {
    if (onSelectBlock) {
      onSelectBlock(null);
    }
  };

  return (
    <TabbedSidebar
      title="Button"
      settingsSchema={settingsSchema}
      stylesSchema={stylesSchema}
      data={data}
      block={block}
      onChangeBlock={onChangeBlock}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onClose={handleClose}
      navRoot={navRoot}
      contentType={contentType}
    />
  );
};

export default ButtonSidebar;