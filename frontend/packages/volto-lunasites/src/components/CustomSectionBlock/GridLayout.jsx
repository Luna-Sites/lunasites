import React from 'react';
import PropTypes from 'prop-types';
import DraggableGridBlock from './DraggableGridBlock';
import GridDragLayer from './GridDragLayer';

const GridLayout = ({ 
  children, 
  gridConfig, 
  blocks, 
  blocks_layout, 
  onUpdatePosition,
  selectedBlock,
  onSelectBlock,
  isDragEnabled = true,
  className = ''
}) => {
  const [tempPositions, setTempPositions] = React.useState({});
  const [draggingBlocks, setDraggingBlocks] = React.useState(new Set());
  const [movedBlocks, setMovedBlocks] = React.useState(new Set());
  const [resizingBlocks, setResizingBlocks] = React.useState(new Set());
  const { columns, rowHeight, positions } = gridConfig;
  
  // Merge temp positions with actual positions for visual updates during drag
  const currentPositions = { ...positions, ...tempPositions };
  
  
  // Simple position update without automatic collision avoidance
  const handleTempPositionUpdate = React.useCallback((blockId, tempPosition, isResize = false) => {
    // Set immediate position update for the dragged block only
    setTempPositions(prev => ({ ...prev, [blockId]: tempPosition }));
    
    if (isResize) {
      setResizingBlocks(prev => new Set([...prev, blockId]));
    } else {
      setDraggingBlocks(prev => new Set([...prev, blockId]));
    }
    
    // Clear moved blocks - no automatic collision avoidance during drag
    setMovedBlocks(new Set());
  }, []);
  
  const clearTempPosition = (blockId) => {
    // Clear all temporary states immediately to prevent flickering
    setTempPositions({});
    setDraggingBlocks(new Set());
    setResizingBlocks(new Set());
    setMovedBlocks(new Set());
  };
  
  // Helper function to find available position for a block
  const findAvailablePositionForBlock = (startX, startY, width, height, excludeBlockId, allPositions) => {
    const columns = gridConfig.columns;
    
    // Check if position is available
    const isPositionAvailable = (x, y, w, h) => {
      // Check bounds
      if (x < 0 || y < 0 || x + w > columns) return false;
      
      // Check collisions with other blocks
      for (const [otherId, pos] of Object.entries(allPositions)) {
        if (otherId !== excludeBlockId && pos) {
          if (!(x >= pos.x + pos.width || 
                x + w <= pos.x || 
                y >= pos.y + pos.height || 
                y + h <= pos.y)) {
            return false; // Collision detected
          }
        }
      }
      return true;
    };

    // Try the target position first
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

    // Ultimate fallback: return original position (shouldn't happen)
    return { x: startX, y: startY, width, height };
  };
  
  // Calculate the total height needed for the grid using current positions
  const maxY = Math.max(0, ...Object.values(currentPositions).map(pos => pos.y + pos.height));
  const totalRows = Math.max(8, maxY); // Minimum 8 rows for empty sections
  
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${totalRows}, ${rowHeight}px)`,
    gap: '8px',
    minHeight: `${totalRows * rowHeight + (totalRows - 1) * 8}px`,
    position: 'relative',
    backgroundColor: 'rgba(248, 249, 250, 0.3)',
    border: '1px dashed rgba(0, 123, 193, 0.3)',
    borderRadius: '8px',
    padding: '8px', // Reduced padding to fix spacing
  };

  const renderGridItem = (blockId) => {
    const position = currentPositions[blockId];
    if (!position) return null;

    const itemStyle = {
      gridColumn: `${position.x + 1} / span ${position.width}`,
      gridRow: `${position.y + 1} / span ${position.height}`,
      minHeight: `${position.height * rowHeight + (position.height - 1) * 8}px`,
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '12px', // More modern rounded corners
      backgroundColor: '#ffffff',
      padding: '8px', // Better content spacing
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)', // Subtle layered shadow
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother easing
    };

    const content = children({ blockId, position });

    return (
      <div
        key={blockId}
        className={`grid-item ${draggingBlocks.has(blockId) ? 'dragging' : ''} ${movedBlocks.has(blockId) ? 'moved' : ''} ${resizingBlocks.has(blockId) ? 'resizing' : ''}`}
        style={itemStyle}
        data-block-id={blockId}
      >
        {isDragEnabled ? (
          <DraggableGridBlock
            blockId={blockId}
            position={position}
            selected={selectedBlock === blockId}
            onSelect={onSelectBlock}
            gridConfig={gridConfig}
            onTempPositionUpdate={handleTempPositionUpdate}
            onClearTempPosition={clearTempPosition}
          >
            {content}
          </DraggableGridBlock>
        ) : (
          <div 
            className={`non-draggable-block ${selectedBlock === blockId ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectBlock) onSelectBlock(blockId);
            }}
            style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            {content}
          </div>
        )}
      </div>
    );
  };

  const renderGridGuides = () => {
    const guides = [];
    
    // Vertical guides
    for (let i = 1; i < columns; i++) {
      guides.push(
        <div
          key={`v-guide-${i}`}
          className="grid-guide vertical"
          style={{
            position: 'absolute',
            left: `calc(${(i / columns) * 100}% - 1px)`,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'rgba(0, 123, 193, 0.1)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      );
    }
    
    // Horizontal guides (every 2 rows for cleaner look)
    for (let i = 2; i < totalRows; i += 2) {
      guides.push(
        <div
          key={`h-guide-${i}`}
          className="grid-guide horizontal"
          style={{
            position: 'absolute',
            top: `calc(${(i / totalRows) * 100}% - 1px)`,
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'rgba(0, 123, 193, 0.1)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      );
    }
    
    return guides;
  };

  const gridContent = (
    <div className={`grid-layout ${className}`} style={gridStyle}>
      {renderGridGuides()}
      
      {/* Render positioned blocks */}
      {blocks_layout.items.map(renderGridItem)}
      
      {/* Render children for any additional content (like FloatingAddButton) */}
      {typeof children === 'function' ? null : children}
    </div>
  );

  return isDragEnabled ? (
    <GridDragLayer 
      gridConfig={gridConfig}
      onDropBlock={onUpdatePosition}
      className={className}
    >
      {gridContent}
    </GridDragLayer>
  ) : (
    gridContent
  );
};

GridLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  gridConfig: PropTypes.shape({
    columns: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
    positions: PropTypes.object.isRequired,
  }).isRequired,
  blocks: PropTypes.object.isRequired,
  blocks_layout: PropTypes.object.isRequired,
  onUpdatePosition: PropTypes.func,
  selectedBlock: PropTypes.string,
  onSelectBlock: PropTypes.func,
  isDragEnabled: PropTypes.bool,
  className: PropTypes.string,
};

GridLayout.defaultProps = {
  children: null,
  onUpdatePosition: () => {},
  selectedBlock: null,
  onSelectBlock: () => {},
  isDragEnabled: true,
  className: '',
};

export default GridLayout;