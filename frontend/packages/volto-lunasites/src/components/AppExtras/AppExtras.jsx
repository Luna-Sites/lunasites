import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { connect } from 'react-redux';

const AppExtras = (props) => {
  const { content } = props;
  const viewClass = content?.view
    ? `view-${content?.view?.token?.toLowerCase() || ''}`
    : '';

  return viewClass ? <BodyClass className={viewClass} /> : null;
};

export default connect((state) => ({
  content: state.content.data,
}))(AppExtras);
