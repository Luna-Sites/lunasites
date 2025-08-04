import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import cx from 'classnames';

const BLOCK_TYPE = 'GRID_BLOCK';

const dragSource = {
  beginDrag: (props) => ({
    blockId: props.blockId,
    position: props.position,
    type: BLOCK_TYPE,
  }),
};

const dragCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
});

const DragHandle = ({ selected }) => (
  <div className="drag-handle" title="Drag to move">
    ⋮⋮
  </div>
);

const PositionInfo = ({ position, selected }) =>
  selected ? (
    <div className="position-info">
      {position.x},{position.y} ({position.width}×{position.height})
    </div>
  ) : null;

const DraggableBlock = ({
  blockId,
  position,
  children,
  selected,
  onSelect,
  connectDragSource,
  isDragging,
  reactDnd,
}) => {
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onSelect?.(blockId);
    },
    [blockId, onSelect],
  );

  const className = cx('draggable-block', {
    selected,
    dragging: isDragging,
    'non-draggable-block': !reactDnd,
  });

  const blockContent = (
    <div className={className} onClick={handleClick} data-block-id={blockId}>
      <DragHandle selected={selected} />
      <div className="block-content">{children}</div>
      <PositionInfo position={position} selected={selected} />
    </div>
  );

  return reactDnd && connectDragSource
    ? connectDragSource(blockContent)
    : blockContent;
};

const createDraggableBlock = (reactDnd) => {
  if (!reactDnd?.DragSource) {
    return DraggableBlock;
  }

  const { DragSource } = reactDnd;
  return DragSource(BLOCK_TYPE, dragSource, dragCollect)(DraggableBlock);
};

const DraggableBlockWithLoadables = ({ reactDnd, ...props }) => {
  const DraggableComponent = createDraggableBlock(reactDnd);
  return <DraggableComponent {...props} reactDnd={reactDnd} />;
};

DragHandle.propTypes = {
  selected: PropTypes.bool,
};

PositionInfo.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  selected: PropTypes.bool,
};

DraggableBlock.propTypes = {
  blockId: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  connectDragSource: PropTypes.func,
  isDragging: PropTypes.bool,
  reactDnd: PropTypes.object,
};

DraggableBlockWithLoadables.propTypes = {
  ...DraggableBlock.propTypes,
  reactDnd: PropTypes.object,
};

export { BLOCK_TYPE };
export default injectLazyLibs(['reactDnd'])(DraggableBlockWithLoadables);
