import React from 'react';
import PropTypes from 'prop-types';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';

const DragDropProvider = ({ children, reactDnd, reactDndHtml5Backend }) => {
  if (!reactDnd || !reactDndHtml5Backend) {
    return <div>Loading drag and drop...</div>;
  }

  const { DragDropContext } = reactDnd;
  const HTML5Backend = reactDndHtml5Backend.default;

  return (
    <DragDropContext backend={HTML5Backend}>
      {children}
    </DragDropContext>
  );
};

DragDropProvider.propTypes = {
  children: PropTypes.node.isRequired,
  reactDnd: PropTypes.object,
  reactDndHtml5Backend: PropTypes.object,
};

export default injectLazyLibs(['reactDnd', 'reactDndHtml5Backend'])(DragDropProvider);