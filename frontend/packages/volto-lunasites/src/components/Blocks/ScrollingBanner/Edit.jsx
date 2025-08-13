import React from 'react';
import PropTypes from 'prop-types';
import { SidebarPortal } from '@plone/volto/components';
import { BlockDataForm } from '@plone/volto/components';
import { scrollingBannerSchemaEnhancer } from './schema';
import ScrollingBannerView from './View';

const ScrollingBannerEdit = ({
  data,
  onChangeBlock,
  block,
  selected,
  ...otherProps
}) => {
  const schema = scrollingBannerSchemaEnhancer({
    schema: {},
    formData: data,
    intl: otherProps.intl,
  });

  return (
    <>
      <ScrollingBannerView data={data} />
      <SidebarPortal selected={selected}>
        <BlockDataForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
          block={block}
        />
      </SidebarPortal>
    </>
  );
};

ScrollingBannerEdit.propTypes = {
  data: PropTypes.object.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  block: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
};

export default ScrollingBannerEdit;
