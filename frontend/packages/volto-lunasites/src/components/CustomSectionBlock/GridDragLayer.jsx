import React from 'react';
import PropTypes from 'prop-types';

const GridDragLayer = ({ 
  gridConfig, 
  onDropBlock, 
  children, 
  className = '' 
}) => {
  const { columns, rowHeight } = gridConfig;

  const handleMouseUp = (e) => {
    // Check if we're dragging a block (simplified approach)
    const draggingElement = document.querySelector('.dragging');
    if (!draggingElement) return;

    const dropZone = e.currentTarget;
    const rect = dropZone.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    // Calculate grid position
    const padding = 16;
    const gap = 8;
    const adjustedX = Math.max(0, relativeX - padding);
    const adjustedY = Math.max(0, relativeY - padding);

    const availableWidth = rect.width - (2 * padding) - ((columns - 1) * gap);
    const cellWidth = availableWidth / columns;
    const cellHeight = rowHeight + gap;

    const gridX = Math.floor(adjustedX / cellWidth);
    const gridY = Math.floor(adjustedY / cellHeight);

    // Get block ID from dragging element
    const blockId = draggingElement.getAttribute('data-block-id');
    if (!blockId) return;

    // Get current position from data attribute or default
    const currentPos = JSON.parse(draggingElement.getAttribute('data-position') || '{"width":6,"height":4}');
    
    const maxX = Math.max(0, columns - currentPos.width);
    const finalX = Math.min(gridX, maxX);
    const finalY = Math.max(0, gridY);

    const newPosition = {
      ...currentPos,
      x: finalX,
      y: finalY
    };

    if (onDropBlock && blockId) {
      onDropBlock(blockId, newPosition);
    }

    // Clean up dragging state
    draggingElement.classList.remove('dragging');
  };

  return (
    <div 
      className={`grid-drag-layer ${className}`}
      onMouseUp={handleMouseUp}
      style={{
        position: 'relative',
        minHeight: '400px',
        cursor: 'default'
      }}
    >
      {children}
    </div>
  );
};

GridDragLayer.propTypes = {
  gridConfig: PropTypes.shape({
    columns: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
  }).isRequired,
  onDropBlock: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

GridDragLayer.defaultProps = {
  onDropBlock: () => {},
  children: null,
  className: '',
};

export default GridDragLayer;