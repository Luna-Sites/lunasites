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
    // Only allow dragging from drag handle to avoid blocking block editing
    const isDragHandle = e.target.closest('.drag-handle');
    
    if (!isDragHandle) {
      // If not drag handle, just select the block but allow event to propagate
      if (onSelect && !selected) {
        onSelect(blockId);
      }
      return;
    }

    // Only prevent default for drag handle
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

    // Cache grid calculations for better performance
    const gridLayer = document.querySelector('.grid-drag-layer');
    const rect = gridLayer?.getBoundingClientRect();
    const padding = 8; // Match the reduced grid padding
    const gap = 8;
    const columns = gridConfig?.columns || 12;
    const rowHeight = gridConfig?.rowHeight || 60;
    const availableWidth = rect ? rect.width - (2 * padding) - ((columns - 1) * gap) : 0;
    const cellWidth = availableWidth / columns;
    const cellHeight = rowHeight + gap;
    const maxX = Math.max(0, columns - position.width);
    
    let lastSnapX = position.x;
    let lastSnapY = position.y;
    
    const handleMouseMove = (moveEvent) => {
      if (!rect) return;
      
      const relativeX = moveEvent.clientX - rect.left;
      const relativeY = moveEvent.clientY - rect.top;
      
      const adjustedX = Math.max(0, relativeX - padding);
      const adjustedY = Math.max(0, relativeY - padding);
      
      // Use floor instead of round for more cursor-following behavior
      // Add small threshold to prevent micro-movements
      const gridX = Math.floor((adjustedX + cellWidth * 0.3) / cellWidth);
      const gridY = Math.floor((adjustedY + cellHeight * 0.3) / cellHeight);
      
      const snapX = Math.min(Math.max(0, gridX), maxX);
      const snapY = Math.max(0, gridY);
      
      // Only update if position actually changed to reduce redraws
      if (snapX !== lastSnapX || snapY !== lastSnapY) {
        lastSnapX = snapX;
        lastSnapY = snapY;
        setSnapPosition({ x: snapX, y: snapY });
        
        if (onTempPositionUpdate) {
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
          top: '10px',
          left: '10px',
          width: '24px',
          height: '18px',
          background: isDragging ? 
            'linear-gradient(135deg, #007bc1 0%, #0056b3 100%)' : 
            'linear-gradient(135deg, rgba(0, 123, 193, 0.9) 0%, rgba(0, 86, 179, 0.9) 100%)',
          borderRadius: '6px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'white',
          opacity: selected ? 1 : 0.75,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 15,
          boxShadow: isDragging ? 
            '0 8px 16px rgba(0, 123, 193, 0.3), 0 4px 8px rgba(0, 0, 0, 0.1)' : 
            '0 2px 8px rgba(0, 123, 193, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)'
        }}
        title="Drag to move"
        onMouseDown={handleMouseDown}
      >
        ⋮⋮
      </div>

      {/* Block Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      
      {/* Position Info (Debug) - only show grid position, no resize info */}
      {selected && (
        <div 
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            fontSize: '9px',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            color: 'white',
            padding: '3px 6px',
            borderRadius: '6px',
            pointerEvents: 'none',
            fontFamily: 'monospace',
            fontWeight: '500',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        >
          Grid: {position.x},{position.y} • {position.width}×{position.height}
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