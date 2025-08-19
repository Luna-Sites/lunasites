import React from 'react';
import { withBlockExtensions } from '@plone/volto/helpers';
import BodyComponent from './Body';
import './view.less';

const View = (props) => {
  const { data } = props;
  const CustomTag = `${data.as || 'div'}`;
  const customId = data?.title
    ?.toLowerCase()
    ?.replace(/[^a-zA-Z-\s]/gi, '')
    ?.trim()
    ?.replace(/\s+/gi, '-');

  return (
    <CustomTag id={customId} className="custom-section-block-view">
      {/* {data.title && <h2 className="custom-section-title">{data.title}</h2>} */}
      <BodyComponent {...props} />
    </CustomTag>
  );
};

export default withBlockExtensions(View);
