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
  onClearTempPosition,
  onUpdateSize
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeDirection, setResizeDirection] = React.useState(null);
  const [snapPosition, setSnapPosition] = React.useState(null);
  const originalPosition = React.useRef(null);
  const resizeStartData = React.useRef(null);

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

  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    const gridLayer = document.querySelector('.grid-drag-layer');
    if (gridLayer) {
      const rect = gridLayer.getBoundingClientRect();
      resizeStartData.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosition: { ...position },
        gridRect: rect
      };
    }
    
    const handleMouseMove = (moveEvent) => {
      if (!resizeStartData.current) return;
      
      const { startX, startY, startPosition, gridRect } = resizeStartData.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Calculate grid cell dimensions
      const padding = 8; // Match the grid padding
      const gap = 8;
      const columns = gridConfig?.columns || 12;
      const rowHeight = gridConfig?.rowHeight || 60;
      const availableWidth = gridRect.width - (2 * padding) - ((columns - 1) * gap);
      const cellWidth = availableWidth / columns;
      const cellHeight = rowHeight + gap;
      
      // Calculate grid units moved
      const gridDeltaX = Math.round(deltaX / cellWidth);
      const gridDeltaY = Math.round(deltaY / cellHeight);
      
      let newPosition = { ...startPosition };
      
      // Apply resize based on direction
      switch (direction) {
        case 'se': // Southeast - resize width and height
          newPosition.width = Math.max(1, Math.min(columns - startPosition.x, startPosition.width + gridDeltaX));
          newPosition.height = Math.max(1, startPosition.height + gridDeltaY);
          break;
        case 'sw': // Southwest - resize width (left) and height
          const newWidth = Math.max(1, startPosition.width - gridDeltaX);
          const newX = Math.max(0, startPosition.x + startPosition.width - newWidth);
          newPosition.x = newX;
          newPosition.width = newWidth;
          newPosition.height = Math.max(1, startPosition.height + gridDeltaY);
          break;
        case 'ne': // Northeast - resize width and height (top)
          newPosition.width = Math.max(1, Math.min(columns - startPosition.x, startPosition.width + gridDeltaX));
          const newHeight = Math.max(1, startPosition.height - gridDeltaY);
          const newY = Math.max(0, startPosition.y + startPosition.height - newHeight);
          newPosition.y = newY;
          newPosition.height = newHeight;
          break;
        case 'nw': // Northwest - resize both dimensions from top-left
          const nwNewWidth = Math.max(1, startPosition.width - gridDeltaX);
          const nwNewHeight = Math.max(1, startPosition.height - gridDeltaY);
          newPosition.x = Math.max(0, startPosition.x + startPosition.width - nwNewWidth);
          newPosition.y = Math.max(0, startPosition.y + startPosition.height - nwNewHeight);
          newPosition.width = nwNewWidth;
          newPosition.height = nwNewHeight;
          break;
        case 'e': // East - resize width only
          newPosition.width = Math.max(1, Math.min(columns - startPosition.x, startPosition.width + gridDeltaX));
          break;
        case 'w': // West - resize width from left
          const wNewWidth = Math.max(1, startPosition.width - gridDeltaX);
          newPosition.x = Math.max(0, startPosition.x + startPosition.width - wNewWidth);
          newPosition.width = wNewWidth;
          break;
        case 's': // South - resize height only
          newPosition.height = Math.max(1, startPosition.height + gridDeltaY);
          break;
        case 'n': // North - resize height from top
          const nNewHeight = Math.max(1, startPosition.height - gridDeltaY);
          newPosition.y = Math.max(0, startPosition.y + startPosition.height - nNewHeight);
          newPosition.height = nNewHeight;
          break;
      }
      
      // Update temporary position for visual feedback
      if (onTempPositionUpdate) {
        onTempPositionUpdate(blockId, newPosition, true); // Pass isResize = true
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      
      // Get the final resized position from temp positions
      const gridLayer = document.querySelector('.grid-drag-layer');
      const blockElement = gridLayer?.querySelector(`[data-block-id="${blockId}"]`);
      
      if (blockElement) {
        const style = window.getComputedStyle(blockElement);
        const gridColumn = style.gridColumn;
        const gridRow = style.gridRow;
        
        if (gridColumn && gridRow) {
          const columnMatch = gridColumn.match(/(\d+) \/ span (\d+)/);
          const rowMatch = gridRow.match(/(\d+) \/ span (\d+)/);
          
          if (columnMatch && rowMatch) {
            const finalPosition = {
              x: parseInt(columnMatch[1]) - 1,
              y: parseInt(rowMatch[1]) - 1,
              width: parseInt(columnMatch[2]),
              height: parseInt(rowMatch[2])
            };
            
            // Trigger final position update
            if (onUpdateSize) {
              onUpdateSize(blockId, finalPosition);
            }
          }
        }
      }
      
      // Clear temporary position
      if (onClearTempPosition) {
        onClearTempPosition(blockId);
      }
      
      resizeStartData.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
        cursor: isDragging ? 'grabbing' : (isResizing ? 'resizing' : (selected ? 'grab' : 'pointer')),
        position: 'relative',
        transition: 'none', // Let CSS Grid handle transitions
        opacity: (isDragging || isResizing) ? 0.8 : 1,
        userSelect: 'none',
        transform: (isDragging || isResizing) ? 'scale(1.02)' : 'scale(1)', // Slight scale up when dragging/resizing
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
      
      {/* Resize Handles - only show when selected */}
      {selected && (
        <>
          {/* Corner handles */}
          <div 
            className="resize-handle nw" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            style={{
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              width: '10px',
              height: '10px',
              background: 'linear-gradient(135deg, #007bc1 0%, #0056b3 100%)',
              cursor: 'nw-resize',
              borderRadius: '50%', // Circular handles
              zIndex: 15,
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0, 123, 193, 0.3)',
              transition: 'all 0.2s ease'
            }}
          />
          <div 
            className="resize-handle ne" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '10px',
              height: '10px',
              background: 'linear-gradient(135deg, #007bc1 0%, #0056b3 100%)',
              cursor: 'ne-resize',
              borderRadius: '50%',
              zIndex: 15,
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0, 123, 193, 0.3)',
              transition: 'all 0.2s ease'
            }}
          />
          <div 
            className="resize-handle sw" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            style={{
              position: 'absolute',
              bottom: '-3px',
              left: '-3px',
              width: '10px',
              height: '10px',
              background: 'linear-gradient(135deg, #007bc1 0%, #0056b3 100%)',
              cursor: 'sw-resize',
              borderRadius: '50%',
              zIndex: 15,
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0, 123, 193, 0.3)',
              transition: 'all 0.2s ease'
            }}
          />
          <div 
            className="resize-handle se" 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              width: '10px',
              height: '10px',
              background: 'linear-gradient(135deg, #007bc1 0%, #0056b3 100%)',
              cursor: 'se-resize',
              borderRadius: '50%',
              zIndex: 15,
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0, 123, 193, 0.3)',
              transition: 'all 0.2s ease'
            }}
          />
          
          {/* Edge handles */}
          <div 
            className="resize-handle n" 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            style={{
              position: 'absolute',
              top: '-3px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '6px',
              background: 'linear-gradient(90deg, #007bc1 0%, #0056b3 100%)',
              cursor: 'n-resize',
              borderRadius: '3px',
              zIndex: 15,
              border: '1px solid white',
              boxShadow: '0 2px 6px rgba(0, 123, 193, 0.3)',
              transition: 'all 0.2s ease'
            }}
          />
          <div 
            className="resize-handle s" 
            onMouseDown={(e) => handleResizeStart(e, 's')}
            style={{
              position: 'absolute',
              bottom: '-3px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '20px',
              height: '6px',
              background: 'linear-gradient(90deg, #007bc1 0%, #0056b3 100%)',
              cursor: 's-resize',
              borderRadius: '3px',
              zIndex: 15,
              border: '1px solid white',
              boxShadow: '0 2px 6px rgba(0, 123, 193, 0.3)',
              transition: 'all 0.2s ease'
            }}
          />
          <div 
            className="resize-handle w" 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            style={{
              position: 'absolute',
              left: '-3px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '6px',
              height: '20px',
              background: 'linear-gradient(0deg, #007bc1 0%, #0056b3 100%)',
              cursor: 'w-resize',
              borderRadius: '3px',
              zIndex: 15,
              border: '1px solid white',
              boxShadow: '0 2px 6px rgba(0, 123, 193, 0.3)',
              transition: 'all 0.2s ease'
            }}
          />
          <div 
            className="resize-handle e" 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            style={{
              position: 'absolute',
              right: '-3px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '6px',
              height: '20px',
              background: 'linear-gradient(0deg, #007bc1 0%, #0056b3 100%)',
              cursor: 'e-resize',
              borderRadius: '3px',
              zIndex: 15,
              border: '1px solid white',
              boxShadow: '0 2px 6px rgba(0, 123, 193, 0.3)',
              transition: 'all 0.2s ease'
            }}
          />
        </>
      )}

      {/* Position Info (Debug) */}
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
          {position.x},{position.y} • {position.width}×{position.height}
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
  onUpdateSize: PropTypes.func,
};

DraggableGridBlock.defaultProps = {
  selected: false,
  onSelect: () => {},
  onStartDrag: () => {},
  onEndDrag: () => {},
  gridConfig: { columns: 12, rowHeight: 60 },
  onTempPositionUpdate: () => {},
  onClearTempPosition: () => {},
  onUpdateSize: () => {},
};

export default DraggableGridBlock;