import React from 'react';
import PropTypes from 'prop-types';

const DraggableGridBlock = ({ 
  blockId, 
  position, 
  children, 
  selected,
  onSelect,
  onStartDrag,
  onEndDrag,
  gridConfig,
  onTempPositionUpdate,
  onClearTempPosition
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [snapPosition, setSnapPosition] = React.useState(null);
  const originalPosition = React.useRef(null);

  const handleMouseDown = (e) => {
    // Allow dragging from anywhere on the block if selected, or from drag handle
    const isDragHandle = e.target.closest('.drag-handle');
    const isBlockSelected = selected;
    
    // Always allow drag from drag handle, or from anywhere if block is selected
    if (!isDragHandle && !isBlockSelected) {
      // If block is not selected, select it first but don't start drag
      if (onSelect) {
        onSelect(blockId);
      }
      return;
    }
    
    // Start drag immediately if drag handle is used or block is selected
    if (!isDragHandle && !isBlockSelected) {
      return; // Safety check
    }

    e.preventDefault();
    e.stopPropagation();
    
    const element = e.currentTarget;
    
    setIsDragging(true);
    originalPosition.current = position;
    element.setAttribute('data-block-id', blockId);
    element.setAttribute('data-position', JSON.stringify(position));
    
    if (onStartDrag) {
      onStartDrag(blockId);
    }

    const handleMouseMove = (moveEvent) => {
      // Calculate grid snap position during drag
      const gridLayer = document.querySelector('.grid-drag-layer');
      if (gridLayer) {
        const rect = gridLayer.getBoundingClientRect();
        const relativeX = moveEvent.clientX - rect.left;
        const relativeY = moveEvent.clientY - rect.top;
        
        const padding = 16;
        const gap = 8;
        const adjustedX = Math.max(0, relativeX - padding);
        const adjustedY = Math.max(0, relativeY - padding);
        
        const columns = gridConfig?.columns || 12;
        const rowHeight = gridConfig?.rowHeight || 60;
        const availableWidth = rect.width - (2 * padding) - ((columns - 1) * gap);
        const cellWidth = availableWidth / columns;
        const cellHeight = rowHeight + gap;
        
        const gridX = Math.round(adjustedX / cellWidth);
        const gridY = Math.round(adjustedY / cellHeight);
        
        const maxX = Math.max(0, columns - position.width);
        const snapX = Math.min(Math.max(0, gridX), maxX);
        const snapY = Math.max(0, gridY);
        
        setSnapPosition({ x: snapX, y: snapY });
        
        // Update the actual grid position temporarily for visual snapping
        if (onTempPositionUpdate && (snapX !== position.x || snapY !== position.y)) {
          onTempPositionUpdate(blockId, { ...position, x: snapX, y: snapY });
        }
      }
    };

    const handleMouseUp = (upEvent) => {
      setIsDragging(false);
      setSnapPosition(null);
      
      // Clear temp position to allow final drop calculation
      if (onClearTempPosition) {
        onClearTempPosition(blockId);
      }
      
      // Find the drop target under the mouse
      const dropTarget = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const gridLayer = dropTarget?.closest('.grid-drag-layer');
      
      if (gridLayer && gridLayer.onMouseUp) {
        gridLayer.onMouseUp(upEvent);
      } else {
        // Manually trigger drop calculation
        const event = new MouseEvent('mouseup', {
          clientX: upEvent.clientX,
          clientY: upEvent.clientY,
          bubbles: true
        });
        gridLayer?.dispatchEvent(event);
      }
      
      if (onEndDrag) {
        onEndDrag(blockId);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(blockId);
    }
  };

  return (
    <div 
      className={`draggable-grid-block ${selected ? 'selected' : ''} ${isDragging ? 'being-dragged' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      data-block-id={blockId}
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: isDragging ? 'grabbing' : (selected ? 'grab' : 'pointer'),
        position: 'relative',
        transition: 'none', // Let CSS Grid handle transitions
        opacity: isDragging ? 0.8 : 1,
        userSelect: 'none',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)', // Slight scale up when dragging
      }}
    >
      {/* Drag Handle */}
      <div 
        className="drag-handle"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          background: isDragging ? '#007bc1' : 'rgba(0, 123, 193, 0.8)',
          borderRadius: '3px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'white',
          opacity: selected ? 1 : 0.8,
          transition: isDragging ? 'none' : 'all 0.2s ease',
          zIndex: 10,
          boxShadow: isDragging ? '0 4px 8px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        title="Drag to move"
        onMouseDown={(e) => {
          e.stopPropagation();
          // Force the mousedown to trigger on the parent
          const parentElement = e.currentTarget.parentElement;
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: e.clientX,
            clientY: e.clientY,
            bubbles: true,
            cancelable: true
          });
          parentElement.dispatchEvent(mouseEvent);
        }}
      >
        ⋮⋮
      </div>

      {/* Block Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Position Info (Debug) */}
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

DraggableGridBlock.propTypes = {
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
  onStartDrag: PropTypes.func,
  onEndDrag: PropTypes.func,
  gridConfig: PropTypes.shape({
    columns: PropTypes.number,
    rowHeight: PropTypes.number,
  }),
  onTempPositionUpdate: PropTypes.func,
  onClearTempPosition: PropTypes.func,
};

DraggableGridBlock.defaultProps = {
  selected: false,
  onSelect: () => {},
  onStartDrag: () => {},
  onEndDrag: () => {},
  gridConfig: { columns: 12, rowHeight: 60 },
  onTempPositionUpdate: () => {},
  onClearTempPosition: () => {},
};

export default DraggableGridBlock;