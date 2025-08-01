import React from 'react';
import PropTypes from 'prop-types';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { BLOCK_TYPE } from './DraggableBlock';

const dropTarget = {
  drop(props, monitor, component) {
    const item = monitor.getItem();
    const clientOffset = monitor.getClientOffset();
    const dropTargetRect = component.decoratedComponentInstance.dropRef.current?.getBoundingClientRect();
    
    if (!clientOffset || !dropTargetRect) return;

    const { columns, rowHeight } = props.gridConfig;

    // Calculate grid position based on drop coordinates
    const relativeX = clientOffset.x - dropTargetRect.left;
    const relativeY = clientOffset.y - dropTargetRect.top;
    
    // Account for padding and gaps
    const padding = 16;
    const gap = 8;
    const adjustedX = Math.max(0, relativeX - padding);
    const adjustedY = Math.max(0, relativeY - padding);
    
    // Calculate grid cell size
    const availableWidth = dropTargetRect.width - (2 * padding) - ((columns - 1) * gap);
    const cellWidth = availableWidth / columns;
    const cellHeight = rowHeight + gap;
    
    // Convert to grid coordinates
    const gridX = Math.floor(adjustedX / cellWidth);
    const gridY = Math.floor(adjustedY / cellHeight);
    
    // Ensure the block fits within grid bounds
    const maxX = Math.max(0, columns - item.position.width);
    const finalX = Math.min(gridX, maxX);
    const finalY = Math.max(0, gridY);

    const newPosition = {
      ...item.position,
      x: finalX,
      y: finalY
    };

    if (props.onDropBlock) {
      props.onDropBlock(item.blockId, newPosition);
    }
  }
};

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

class GridDropZone extends React.Component {
  constructor(props) {
    super(props);
    this.dropRef = React.createRef();
  }

  render() {
    const { 
      gridConfig, 
      onDropBlock,
      children,
      className = '',
      connectDropTarget,
      isOver,
      canDrop,
      reactDnd
    } = this.props;

    // If react-dnd is not available, render without drop functionality
    if (!reactDnd || !connectDropTarget) {
      return (
        <div 
          ref={this.dropRef}
          className={`grid-drop-zone ${className}`}
          style={{
            position: 'relative',
            minHeight: '400px',
          }}
        >
          {children}
        </div>
      );
    }

    const dropZoneStyle = {
      position: 'relative',
      minHeight: '400px',
      transition: 'all 0.2s ease',
      ...(isOver && canDrop && {
        backgroundColor: 'rgba(0, 123, 193, 0.1)',
        borderColor: 'rgba(0, 123, 193, 0.4)',
      }),
      ...(isOver && !canDrop && {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderColor: 'rgba(255, 0, 0, 0.4)',
      })
    };

    return connectDropTarget(
      <div 
        ref={this.dropRef}
        className={`grid-drop-zone ${className} ${isOver ? 'drop-over' : ''} ${canDrop ? 'can-drop' : 'cannot-drop'}`}
        style={dropZoneStyle}
      >
        {children}
        
        {/* Drop indicator */}
        {isOver && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 1000,
              border: `2px dashed ${canDrop ? '#007bc1' : '#ff4444'}`,
              borderRadius: '8px',
              backgroundColor: canDrop 
                ? 'rgba(0, 123, 193, 0.05)' 
                : 'rgba(255, 68, 68, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: canDrop ? '#007bc1' : '#ff4444',
            }}
          >
            {canDrop ? '📍 Drop here' : '❌ Cannot drop here'}
          </div>
        )}
      </div>
    );
  }
}

const createDropZone = (reactDnd) => {
  if (!reactDnd) {
    return GridDropZone;
  }
  
  const { DropTarget } = reactDnd;
  return DropTarget(BLOCK_TYPE, dropTarget, dropCollect)(GridDropZone);
};

GridDropZone.propTypes = {
  gridConfig: PropTypes.shape({
    columns: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
  }).isRequired,
  onDropBlock: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  // react-dnd props (optional when not available)
  connectDropTarget: PropTypes.func,
  isOver: PropTypes.bool,
  canDrop: PropTypes.bool,
  reactDnd: PropTypes.object,
};

GridDropZone.defaultProps = {
  onDropBlock: () => {},
  children: null,
  className: '',
  connectDropTarget: null,
  isOver: false,
  canDrop: false,
};

const GridDropZoneWithLoadables = ({ reactDnd, ...props }) => {
  const DropZoneComponent = createDropZone(reactDnd);
  return <DropZoneComponent {...props} reactDnd={reactDnd} />;
};

GridDropZoneWithLoadables.propTypes = {
  ...GridDropZone.propTypes,
  reactDnd: PropTypes.object,
};

export default injectLazyLibs(['reactDnd'])(GridDropZoneWithLoadables);