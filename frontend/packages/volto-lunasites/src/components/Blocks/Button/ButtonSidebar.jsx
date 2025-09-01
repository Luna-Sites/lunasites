import React from 'react';
import { ButtonSettingsSchema, ButtonStylesSchema } from './schema';
import { useIntl } from 'react-intl';
import TabbedSidebar from '../../TabbedSidebar';

const ButtonSidebar = (props) => {
  const { data, block, onChangeBlock, navRoot, contentType } = props;
  const intl = useIntl();
  const settingsSchema = ButtonSettingsSchema({ ...props, intl });
  const stylesSchema = ButtonStylesSchema({ ...props, intl });

  return (
    <TabbedSidebar
      title="Button"
      settingsSchema={settingsSchema}
      stylesSchema={stylesSchema}
      data={data}
      block={block}
      onChangeBlock={onChangeBlock}
      navRoot={navRoot}
      contentType={contentType}
    />
  );
};

export default ButtonSidebar;