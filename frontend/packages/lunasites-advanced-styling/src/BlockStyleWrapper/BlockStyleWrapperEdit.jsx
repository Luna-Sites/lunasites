import React from 'react';
import { StyleWrapperView } from '../StyleWrapper';

// For blocks, store the style data in data.styles
// No popup needed - styling is handled by Volto's native sidebar

const BlockStyleWrapperEdit = (props) => {
  const { data = {}, children } = props;

  return (
    <StyleWrapperView mode="edit" {...props} styleData={data.styles || {}}>
      {children}
    </StyleWrapperView>
  );
};

export default BlockStyleWrapperEdit;
