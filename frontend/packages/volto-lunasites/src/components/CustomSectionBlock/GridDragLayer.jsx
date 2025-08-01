import React from 'react';
import PropTypes from 'prop-types';

const GridDragLayer = ({ 
  gridConfig, 
  onDropBlock, 
  children, 
  className = '' 
}) => {
  const { columns, rowHeight } = gridConfig;
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [snapPreview, setSnapPreview] = React.useState(null);
  const layerRef = React.useRef(null);

  React.useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const handleMouseUp = (e) => {
      // Look for block being dragged by checking for data attributes
      const draggedElement = document.querySelector('[data-block-id][data-position]');
      if (!draggedElement) return;

      const rect = layer.getBoundingClientRect();
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

      // Get block info
      const blockId = draggedElement.getAttribute('data-block-id');
      const positionData = draggedElement.getAttribute('data-position');
      
      if (!blockId || !positionData) return;

      const currentPos = JSON.parse(positionData);
      
      // Ensure block fits within grid bounds
      const maxX = Math.max(0, columns - currentPos.width);
      let targetX = Math.min(Math.max(0, gridX), maxX);
      let targetY = Math.max(0, gridY);

      // Find first available position starting from target position
      const finalPosition = findAvailablePosition(
        targetX, 
        targetY, 
        currentPos.width, 
        currentPos.height, 
        blockId
      );

      if (onDropBlock && blockId) {
        onDropBlock(blockId, finalPosition);
      }

      // Clean up
      draggedElement.removeAttribute('data-block-id');
      draggedElement.removeAttribute('data-position');
      setIsDragOver(false);
    };

    // Helper function to find available position without collisions
    const findAvailablePosition = (startX, startY, width, height, excludeBlockId) => {
      // Get current positions of all other blocks
      const currentPositions = {};
      const gridItems = layer.querySelectorAll('.grid-item[data-block-id]');
      
      gridItems.forEach(item => {
        const id = item.getAttribute('data-block-id');
        if (id && id !== excludeBlockId) {
          // Parse position from grid CSS
          const style = window.getComputedStyle(item);
          const gridColumn = style.gridColumn;
          const gridRow = style.gridRow;
          
          if (gridColumn && gridRow) {
            const columnMatch = gridColumn.match(/(\d+) \/ span (\d+)/);
            const rowMatch = gridRow.match(/(\d+) \/ span (\d+)/);
            
            if (columnMatch && rowMatch) {
              currentPositions[id] = {
                x: parseInt(columnMatch[1]) - 1,
                y: parseInt(rowMatch[1]) - 1,
                width: parseInt(columnMatch[2]),
                height: parseInt(rowMatch[2])
              };
            }
          }
        }
      });

      // Check if position is available
      const isPositionAvailable = (x, y, w, h) => {
        // Check bounds
        if (x < 0 || y < 0 || x + w > columns) return false;
        
        // Check collisions with other blocks
        for (const pos of Object.values(currentPositions)) {
          if (!(x >= pos.x + pos.width || 
                x + w <= pos.x || 
                y >= pos.y + pos.height || 
                y + h <= pos.y)) {
            return false; // Collision detected
          }
        }
        return true;
      };

      // Try the exact target position first
      if (isPositionAvailable(startX, startY, width, height)) {
        return { x: startX, y: startY, width, height };
      }

      // Search for nearby available positions in a spiral pattern
      for (let radius = 1; radius <= Math.max(columns, 20); radius++) {
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
              const testX = startX + dx;
              const testY = startY + dy;
              
              if (isPositionAvailable(testX, testY, width, height)) {
                return { x: testX, y: testY, width, height };
              }
            }
          }
        }
      }

      // Fallback: find any available position
      for (let y = 0; y < 50; y++) {
        for (let x = 0; x <= columns - width; x++) {
          if (isPositionAvailable(x, y, width, height)) {
            return { x, y, width, height };
          }
        }
      }

      // Ultimate fallback: return original position
      return { x: startX, y: startY, width, height };
    };

    const handleMouseMove = (e) => {
      const draggedElement = document.querySelector('[data-block-id][data-position]');
      if (!draggedElement) return;

      const rect = layer.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      // Calculate snap position
      const padding = 16;
      const gap = 8;
      const adjustedX = Math.max(0, relativeX - padding);
      const adjustedY = Math.max(0, relativeY - padding);

      const availableWidth = rect.width - (2 * padding) - ((columns - 1) * gap);
      const cellWidth = availableWidth / columns;
      const cellHeight = rowHeight + gap;

      const gridX = Math.floor(adjustedX / cellWidth);
      const gridY = Math.floor(adjustedY / cellHeight);

      const positionData = draggedElement.getAttribute('data-position');
      if (positionData) {
        const currentPos = JSON.parse(positionData);
        const maxX = Math.max(0, columns - currentPos.width);
        const snapX = Math.min(Math.max(0, gridX), maxX);
        const snapY = Math.max(0, gridY);

        setSnapPreview({
          x: snapX,
          y: snapY,
          width: currentPos.width,
          height: currentPos.height
        });
      }
    };

    const handleMouseEnter = () => setIsDragOver(true);
    const handleMouseLeave = () => {
      setIsDragOver(false);
      setSnapPreview(null);
    };

    layer.addEventListener('mouseup', handleMouseUp);
    layer.addEventListener('mousemove', handleMouseMove);
    layer.addEventListener('mouseenter', handleMouseEnter);
    layer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      layer.removeEventListener('mouseup', handleMouseUp);
      layer.removeEventListener('mousemove', handleMouseMove);
      layer.removeEventListener('mouseenter', handleMouseEnter);
      layer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [columns, rowHeight, onDropBlock]);

  return (
    <div 
      ref={layerRef}
      className={`grid-drag-layer ${className} ${isDragOver ? 'drag-over' : ''}`}
      style={{
        position: 'relative',
        minHeight: '400px',
        cursor: 'default',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
      
      {/* Snap Preview */}
      {snapPreview && (
        <div 
          style={{
            position: 'absolute',
            gridColumn: `${snapPreview.x + 1} / span ${snapPreview.width}`,
            gridRow: `${snapPreview.y + 1} / span ${snapPreview.height}`,
            background: 'rgba(0, 123, 193, 0.2)',
            border: '2px solid rgba(0, 123, 193, 0.6)',
            borderRadius: '6px',
            pointerEvents: 'none',
            zIndex: 998,
            display: 'grid',
            placeItems: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: '#007bc1'
          }}
        >
          Drop here
        </div>
      )}
      
      {/* Drop indicator overlay */}
      {isDragOver && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 123, 193, 0.02)',
            border: '2px dashed rgba(0, 123, 193, 0.2)',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 997
          }}
        />
      )}
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