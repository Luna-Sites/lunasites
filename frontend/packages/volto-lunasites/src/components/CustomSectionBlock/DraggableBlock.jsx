import React from 'react';
import PropTypes from 'prop-types';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';

const BLOCK_TYPE = 'GRID_BLOCK';

const dragSource = {
  beginDrag(props) {
    return {
      blockId: props.blockId,
      position: props.position,
      type: BLOCK_TYPE
    };
  }
};

const dragCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

const DraggableBlock = ({ 
  blockId, 
  position, 
  children, 
  onUpdatePosition,
  selected,
  onSelect,
  gridConfig,
  connectDragSource,
  isDragging,
  reactDnd
}) => {
  
  if (!reactDnd) {
    return (
      <div 
        className={`draggable-block ${selected ? 'selected' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(blockId);
        }}
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer'
        }}
      >
        {children}
      </div>
    );
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(blockId);
    }
  };

  const blockStyle = {
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.7 : 1,
    transform: isDragging ? 'rotate(2deg)' : 'none',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: isDragging ? 'none' : 'all 0.2s ease',
  };

  return connectDragSource(
    <div 
      className={`draggable-block ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
      style={blockStyle}
      data-block-id={blockId}
    >
      {/* Drag Handle */}
      <div 
        className="drag-handle"
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '20px',
          height: '20px',
          background: 'rgba(0, 123, 193, 0.8)',
          borderRadius: '4px',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'white',
          opacity: selected ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        title="Drag to move"
      >
        ⋮⋮
      </div>

      {/* Block Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Position Info (Debug - can be removed later) */}
      {selected && (
        <div 
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '4px',
            fontSize: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            pointerEvents: 'none'
          }}
        >
          {position.x},{position.y} ({position.width}×{position.height})
        </div>
      )}
    </div>
  );
};

const createDraggableBlock = (reactDnd) => {
  if (!reactDnd) {
    return DraggableBlock;
  }
  
  const { DragSource } = reactDnd;
  return DragSource(BLOCK_TYPE, dragSource, dragCollect)(DraggableBlock);
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
  onUpdatePosition: PropTypes.func,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  gridConfig: PropTypes.shape({
    columns: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
  }).isRequired,
  // react-dnd props (optional when not draggable)
  connectDragSource: PropTypes.func,
  isDragging: PropTypes.bool,
  reactDnd: PropTypes.object,
};

DraggableBlock.defaultProps = {
  onUpdatePosition: () => {},
  selected: false,
  onSelect: () => {},
  connectDragSource: (el) => el,
  isDragging: false,
};

const DraggableBlockWithLoadables = ({ reactDnd, ...props }) => {
  const DraggableComponent = createDraggableBlock(reactDnd);
  return <DraggableComponent {...props} reactDnd={reactDnd} />;
};

DraggableBlockWithLoadables.propTypes = {
  ...DraggableBlock.propTypes,
  reactDnd: PropTypes.object,
};

export { BLOCK_TYPE };
export default injectLazyLibs(['reactDnd'])(DraggableBlockWithLoadables);