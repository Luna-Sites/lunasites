import React from 'react';
import PropTypes from 'prop-types';
import DraggableGridBlock, { checkBlockCollision } from './DraggableGridBlock';
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
  className = '',
}) => {
  const [tempPositions, setTempPositions] = React.useState({});
  const [draggingBlocks, setDraggingBlocks] = React.useState(new Set());
  const [movedBlocks, setMovedBlocks] = React.useState(new Set());
  const [resizingBlocks, setResizingBlocks] = React.useState(new Set());
  const { columns, rowHeight, positions } = gridConfig;

  // Merge temp positions with actual positions for visual updates during drag
  const currentPositions = { ...positions, ...tempPositions };

  // Optimized temp position update with reduced state thrashing
  const handleTempPositionUpdate = React.useCallback(
    (blockId, tempPosition, isResize = false) => {
      // Batch state updates to prevent race conditions
      React.startTransition(() => {
        setTempPositions((prev) => ({ ...prev, [blockId]: tempPosition }));
        
        if (isResize) {
          setResizingBlocks((prev) => new Set([...prev, blockId]));
          setDraggingBlocks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(blockId); // Remove from dragging if resizing
            return newSet;
          });
        } else {
          setDraggingBlocks((prev) => new Set([...prev, blockId]));
          setResizingBlocks((prev) => {
            const newSet = new Set(prev);
            newSet.delete(blockId); // Remove from resizing if dragging
            return newSet;
          });
        }
        
        // Clear moved blocks to prevent conflicts
        setMovedBlocks(new Set());
      });
    },
    [],
  );

  // Fixed: clear only the specific block's temp state, not all blocks
  const clearTempPosition = React.useCallback((blockId) => {
    React.startTransition(() => {
      // Only clear the specific block's temp position
      setTempPositions((prev) => {
        const newTemp = { ...prev };
        delete newTemp[blockId];
        return newTemp;
      });
      
      // Remove block from all tracking sets
      setDraggingBlocks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
      
      setResizingBlocks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
      
      setMovedBlocks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
    });
  }, []);

  const handleFinalizePosition = React.useCallback((blockId, finalPosition) => {
    try {
      // Validate inputs
      if (!blockId || !finalPosition) {
        console.error('Invalid parameters for handleFinalizePosition:', { blockId, finalPosition });
        return;
      }

      // Use transition to batch all final position updates
      React.startTransition(() => {
        try {
          // Clear temp positions for this block first
          clearTempPosition(blockId);
          
          // Validate position bounds
          const columns = Math.max(1, gridConfig.columns || 12);
          const safePosition = {
            x: Math.max(0, Math.min(finalPosition.x, columns - finalPosition.width)),
            y: Math.max(0, finalPosition.y),
            width: Math.max(1, finalPosition.width),
            height: Math.max(1, finalPosition.height)
          };
          
          // Use the unified collision detection with error handling
          let hasCollision = false;
          try {
            hasCollision = checkBlockCollision(
              safePosition.x,
              safePosition.y,
              safePosition.width,
              safePosition.height,
              positions,
              blockId,
              columns
            );
          } catch (collisionError) {
            console.warn('Error during collision check, assuming collision:', collisionError);
            hasCollision = true;
          }
          
          let targetPosition = safePosition;
          
          // Only search for alternative position if there's a collision
          if (hasCollision) {
            console.warn('Collision detected, finding alternative position');
            try {
              targetPosition = findAvailablePositionForBlock(
                safePosition.x,
                safePosition.y,
                safePosition.width,
                safePosition.height,
                blockId,
                positions
              );
            } catch (fallbackError) {
              console.error('Error finding fallback position:', fallbackError);
              // Keep the safe position as fallback
            }
          }
          
          // Update the actual position through the parent with error handling
          if (onUpdatePosition && typeof onUpdatePosition === 'function') {
            try {
              onUpdatePosition(blockId, targetPosition);
            } catch (updateError) {
              console.error('Error updating block position:', updateError);
            }
          } else {
            console.warn('onUpdatePosition is not available or not a function');
          }
        } catch (transitionError) {
          console.error('Error during position finalization:', transitionError);
        }
      });
    } catch (criticalError) {
      console.error('Critical error in handleFinalizePosition:', criticalError);
    }
  }, [onUpdatePosition, positions, gridConfig.columns, clearTempPosition]);


  // Calculate the total height needed for the grid with error handling
  let maxY = 0;
  try {
    const validPositions = Object.values(currentPositions).filter(pos => pos && typeof pos.y === 'number' && typeof pos.height === 'number');
    if (validPositions.length > 0) {
      maxY = Math.max(0, ...validPositions.map((pos) => pos.y + pos.height));
    }
  } catch (error) {
    console.warn('Error calculating grid height:', error);
    maxY = 8; // Safe fallback
  }
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

    const content = children({ blockId, position });

    return isDragEnabled ? (
      <DraggableGridBlock
        key={blockId}
        blockId={blockId}
        position={position}
        selected={selectedBlock === blockId}
        onSelect={onSelectBlock}
        gridConfig={gridConfig}
        onTempPositionUpdate={handleTempPositionUpdate}
        onClearTempPosition={clearTempPosition}
        onFinalizePosition={handleFinalizePosition}
        allBlockPositions={positions} // Pass all block positions for collision detection
        className={`grid-item ${
          draggingBlocks.has(blockId) ? 'dragging' : ''
        } ${movedBlocks.has(blockId) ? 'moved' : ''} ${
          resizingBlocks.has(blockId) ? 'resizing' : ''
        }`}
      >
        {content}
      </DraggableGridBlock>
    ) : (
      <div
        key={blockId}
        className={`grid-item non-draggable-block ${
          selectedBlock === blockId ? 'selected' : ''
        } ${draggingBlocks.has(blockId) ? 'dragging' : ''} ${
          movedBlocks.has(blockId) ? 'moved' : ''
        } ${resizingBlocks.has(blockId) ? 'resizing' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectBlock) onSelectBlock(blockId);
        }}
        style={{
          gridColumn: `${position.x + 1} / span ${position.width}`,
          gridRow: `${position.y + 1} / span ${position.height}`,
          position: 'relative',
          cursor: 'pointer',
        }}
        data-block-id={blockId}
      >
        {content}
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
        />,
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
        />,
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
