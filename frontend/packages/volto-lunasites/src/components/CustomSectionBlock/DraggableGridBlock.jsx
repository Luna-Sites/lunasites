import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { createPortal } from 'react-dom';

const GRID_CONSTANTS = {
  PADDING: 8,
  GAP: 8,
  DEFAULT_COLUMNS: 12,
  DEFAULT_ROW_HEIGHT: 60,
  CELL_WIDTH_THRESHOLD: 0.2,
  CELL_HEIGHT_THRESHOLD: 0.2,
};

// Optimized collision detection with early exit and caching
let collisionCache = new Map();
let cacheKey = '';

export const checkBlockCollision = (x, y, width, height, allBlockPositions, excludeBlockId, columns) => {
  // Create cache key for this collision check
  const currentCacheKey = `${x},${y},${width},${height},${excludeBlockId},${Object.keys(allBlockPositions).length}`;
  
  // Use cached result if positions haven't changed
  if (currentCacheKey === cacheKey && collisionCache.has(currentCacheKey)) {
    return collisionCache.get(currentCacheKey);
  }
  
  // Clear cache if positions changed
  if (currentCacheKey !== cacheKey) {
    collisionCache.clear();
    cacheKey = currentCacheKey;
  }

  // Fast bounds check first
  if (x < 0 || y < 0 || x + width > columns) {
    collisionCache.set(currentCacheKey, true);
    return true;
  }

  // Pre-calculate block boundaries for efficiency
  const x2 = x + width;
  const y2 = y + height;

  // Optimized collision detection with early exit
  for (const [otherId, otherPos] of Object.entries(allBlockPositions)) {
    // Skip self and undefined positions
    if (otherId === excludeBlockId || !otherPos) {
      continue;
    }

    // Fast rectangle overlap check - no collision if:
    // - Current block is completely to the right of other
    // - Current block is completely to the left of other  
    // - Current block is completely below other
    // - Current block is completely above other
    if (x >= otherPos.x + otherPos.width ||  // right of other
        x2 <= otherPos.x ||                  // left of other
        y >= otherPos.y + otherPos.height || // below other
        y2 <= otherPos.y) {                 // above other
      continue; // No collision with this block
    }
    
    // If we reach here, there's a collision
    collisionCache.set(currentCacheKey, true);
    return true;
  }
  
  // No collisions found
  collisionCache.set(currentCacheKey, false);
  return false;
};

const DraggableGridBlock = ({
  blockId,
  position,
  children,
  selected,
  onSelect,
  onStartDrag,
  onEndDrag,
  gridConfig = {},
  onTempPositionUpdate,
  onClearTempPosition,
  onFinalizePosition,
  className = '',
  allBlockPositions = {},
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });
  const [snapPreview, setSnapPreview] = useState(null);
  const originalPosition = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const blockRef = useRef(null);

  // Enhanced grid metrics calculation with comprehensive error handling
  const calculateGridMetrics = useCallback(() => {
    try {
      // Find the grid container with multiple fallback strategies
      const gridLayer = document.querySelector('.grid-layout') || 
                       document.querySelector('.grid-drag-layer') ||
                       document.querySelector('[data-block-id]')?.closest('[class*="grid"]');
      
      if (!gridLayer) {
        console.error('Grid container not found - drag operation may not work correctly');
        return null;
      }

      const rect = gridLayer.getBoundingClientRect();
      const columns = Math.max(1, gridConfig.columns || GRID_CONSTANTS.DEFAULT_COLUMNS);
      const rowHeight = Math.max(20, gridConfig.rowHeight || GRID_CONSTANTS.DEFAULT_ROW_HEIGHT);

      if (!rect || rect.width <= 0 || rect.height <= 0) {
        console.warn('Grid container has invalid dimensions:', rect);
        return null;
      }

      // Calculate with safety bounds
      const totalGaps = (columns - 1) * GRID_CONSTANTS.GAP + 2 * GRID_CONSTANTS.PADDING;
      const availableWidth = Math.max(100, rect.width - totalGaps); // Minimum 100px
      const cellWidth = Math.max(20, availableWidth / columns); // Minimum 20px per cell
      const cellHeight = rowHeight;

      return { 
        rect, 
        cellWidth, 
        cellHeight, 
        columns,
        padding: GRID_CONSTANTS.PADDING 
      };
    } catch (error) {
      console.error('Error calculating grid metrics:', error);
      return null;
    }
  }, [gridConfig.columns, gridConfig.rowHeight]);

  // Use the optimized collision detection function
  const hasCollision = useCallback((x, y, width, height, excludeBlockId = blockId) => {
    const columns = gridConfig.columns || GRID_CONSTANTS.DEFAULT_COLUMNS;
    return checkBlockCollision(x, y, width, height, allBlockPositions, excludeBlockId, columns);
  }, [allBlockPositions, blockId, gridConfig.columns]);

  // Enhanced position calculation with comprehensive error handling
  const calculateSnapPosition = useCallback((clientX, clientY, metrics) => {
    try {
      if (!metrics) {
        console.warn('Invalid metrics provided to calculateSnapPosition');
        return { x: position.x, y: position.y, collision: false }; // Fallback to current position
      }

      const { rect, cellWidth, cellHeight, columns, padding } = metrics;

      // Validate inputs
      if (!rect || cellWidth <= 0 || cellHeight <= 0) {
        console.warn('Invalid grid metrics:', metrics);
        return { x: position.x, y: position.y, collision: false };
      }

      // Safe coordinate conversion with bounds checking
      const relativeX = Math.max(0, clientX - rect.left - padding);
      const relativeY = Math.max(0, clientY - rect.top - padding);
      
      const gridX = Math.round(relativeX / cellWidth);
      const gridY = Math.round(relativeY / cellHeight);

      // Apply strict bounds constraints
      const maxX = Math.max(0, columns - position.width);
      const boundedX = Math.min(Math.max(0, gridX), maxX);
      const boundedY = Math.max(0, gridY);

      // Check for collision with error handling
      let collision = false;
      try {
        collision = hasCollision(boundedX, boundedY, position.width, position.height);
      } catch (collisionError) {
        console.warn('Error during collision detection:', collisionError);
        collision = true; // Assume collision on error to prevent invalid drops
      }

      return {
        x: boundedX,
        y: boundedY,
        collision,
      };
    } catch (error) {
      console.error('Error calculating snap position:', error);
      // Return safe fallback position
      return { x: position.x, y: position.y, collision: false };
    }
  }, [hasCollision, position.width, position.height, position.x, position.y]);

  const handleDragEnd = useCallback(() => {
    // Use React 18's automatic batching for state updates
    setIsDragging(false);
    setGhostPosition({ x: 0, y: 0 });
    setSnapPreview(null);
    
    // Call onEndDrag after state cleanup to prevent race conditions
    setTimeout(() => {
      onEndDrag?.(blockId);
    }, 0);
  }, [blockId, onEndDrag]);

  // Helper function to find nearest safe position when collision occurs
  const findNearestSafePosition = useCallback((targetX, targetY) => {
    try {
      const columns = gridConfig.columns || GRID_CONSTANTS.DEFAULT_COLUMNS;
      
      // Try positions in expanding radius around target
      for (let radius = 1; radius <= 3; radius++) {
        // Check horizontal positions first
        for (let dx = -radius; dx <= radius; dx++) {
          const testX = Math.max(0, Math.min(targetX + dx, columns - position.width));
          if (!hasCollision(testX, targetY, position.width, position.height)) {
            return { x: testX, y: targetY };
          }
        }
        
        // Check vertical positions
        for (let dy = 1; dy <= radius; dy++) {
          const testY = targetY + dy;
          if (!hasCollision(targetX, testY, position.width, position.height)) {
            return { x: targetX, y: testY };
          }
        }
      }
      
      // If no nearby position found, scan for any available position
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x <= columns - position.width; x++) {
          if (!hasCollision(x, y, position.width, position.height)) {
            return { x, y };
          }
        }
      }
      
      return null; // No safe position found
    } catch (error) {
      console.error('Error finding safe position:', error);
      return null;
    }
  }, [hasCollision, gridConfig.columns, position.width, position.height]);

  const handleMouseDown = useCallback(
    (e) => {
      // Don't interfere with resize handles
      if (e.target.closest('.content-resize-handle')) {
        return;
      }
      
      if (!e.target.closest('.drag-handle')) {
        if (onSelect && !selected) {
          onSelect(blockId);
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const metrics = calculateGridMetrics();
      if (!metrics) {
        console.warn('Cannot start drag: grid metrics unavailable');
        return;
      }

      // Calculate drag offset more efficiently
      if (blockRef.current) {
        const blockRect = blockRef.current.getBoundingClientRect();
        dragOffset.current = {
          x: e.clientX - blockRect.left,
          y: e.clientY - blockRect.top,
        };
      } else {
        // Fallback to center offset
        dragOffset.current = { x: 50, y: 25 };
      }

      setIsDragging(true);
      setGhostPosition({ x: e.clientX, y: e.clientY });
      originalPosition.current = position;
      onStartDrag?.(blockId);

      let lastSnapPosition = { x: position.x, y: position.y };

      const handleMouseMove = (moveEvent) => {
        try {
          // Batch ghost position and snap preview updates
          const newGhostPos = { x: moveEvent.clientX, y: moveEvent.clientY };
          
          // Calculate snap preview for drop zone indication
          const snapPos = calculateSnapPosition(
            moveEvent.clientX,
            moveEvent.clientY,
            metrics,
          );

          // Only update snap preview if position or collision state changed
          const positionChanged = snapPos && (
            snapPos.x !== lastSnapPosition.x ||
            snapPos.y !== lastSnapPosition.y ||
            snapPos.collision !== lastSnapPosition.collision
          );

          if (positionChanged) {
            lastSnapPosition = snapPos;
            
            // Batch state updates for smooth performance
            React.startTransition(() => {
              setGhostPosition(newGhostPos);
              setSnapPreview(snapPos);
            });
          } else {
            // Always update ghost position for smooth cursor following
            setGhostPosition(newGhostPos);
          }
        } catch (error) {
          console.warn('Error during drag move:', error);
        }
      };

      const handleMouseUp = (upEvent) => {
        try {
          // Calculate final position with comprehensive error handling
          let finalPosition = originalPosition.current || position; // Safe default
          
          if (metrics) {
            const finalSnapPos = calculateSnapPosition(
              upEvent.clientX,
              upEvent.clientY,
              metrics,
            );
            
            if (finalSnapPos && !finalSnapPos.collision) {
              // Valid position found - use it
              finalPosition = { 
                ...position, 
                x: finalSnapPos.x, 
                y: finalSnapPos.y 
              };
              console.log(`Successfully dropped block at ${finalSnapPos.x},${finalSnapPos.y}`);
            } else if (finalSnapPos && finalSnapPos.collision) {
              // Collision detected - try to find nearby safe position
              console.warn('Collision detected, attempting to find safe position');
              const safePosition = findNearestSafePosition(finalSnapPos.x, finalSnapPos.y);
              if (safePosition) {
                finalPosition = { ...position, ...safePosition };
                console.log(`Found safe position at ${safePosition.x},${safePosition.y}`);
              } else {
                console.warn('No safe position found, reverting to original');
                // finalPosition already set to original
              }
            }
          } else {
            console.warn('No valid grid metrics, reverting to original position');
          }
          
          // Always call finalize with a valid position
          onFinalizePosition?.(blockId, finalPosition);
          
        } catch (error) {
          console.error('Critical error during drag end:', error);
          // Emergency fallback to original position
          onFinalizePosition?.(blockId, originalPosition.current || position);
        } finally {
          setSnapPreview(null);
          handleDragEnd();
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [
      blockId,
      position,
      selected,
      onSelect,
      onStartDrag,
      calculateGridMetrics,
      calculateSnapPosition,
      onFinalizePosition,
      handleDragEnd,
      findNearestSafePosition,
    ],
  );

  const handleClick = useCallback(
    (e) => {
      // Don't interfere with resize handles
      if (e.target.closest('.content-resize-handle')) {
        return;
      }
      
      e.stopPropagation();
      onSelect?.(blockId);
    },
    [blockId, onSelect],
  );

  const gridStyle = {
    gridColumn: `${position.x + 1} / span ${position.width}`,
    gridRow: `${position.y + 1} / span ${position.height}`,
  };

  const blockClassName = cx('draggable-grid-block', className, {
    selected,
    'being-dragged': isDragging,
  });

  // Simple cursor following indicator - no tilting, just shows you're dragging
  const ghostElement = isDragging && (
    <div
      className="drag-cursor-indicator"
      style={{
        position: 'fixed',
        left: ghostPosition.x + 10, // Slight offset from cursor
        top: ghostPosition.y - 30,
        zIndex: 10000,
        pointerEvents: 'none',
        background: 'rgba(0, 123, 193, 0.9)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
    >
      Moving block...
    </div>
  );

  return (
    <>
      <div
        ref={blockRef}
        className={blockClassName}
        onClick={handleClick}
        data-block-id={blockId}
        style={gridStyle}
      >
        <div
          className="drag-handle"
          title="Drag to move"
          onMouseDown={handleMouseDown}
        >
          ⋮⋮
        </div>

        {children}

        {selected && (
          <div className="grid-position-info">
            Grid: {position.x},{position.y} • {position.width}×{position.height}
          </div>
        )}
      </div>
      
      {/* Render ghost element in document body */}
      {typeof document !== 'undefined' && ghostElement && 
        createPortal(ghostElement, document.body)
      }
      
      {/* Show actual block content in the drop preview position */}
      {snapPreview && (
        <div
          className={`drop-preview ${snapPreview.collision ? 'invalid' : 'valid'}`}
          style={{
            gridColumn: `${snapPreview.x + 1} / span ${position.width}`,
            gridRow: `${snapPreview.y + 1} / span ${position.height}`,
            position: 'relative',
            background: 'rgba(248, 249, 250, 0.95)',
            border: `3px solid ${
              snapPreview.collision 
                ? '#ff4444' 
                : '#007bc1'
            }`,
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 999,
            opacity: 0.9,
          }}
        >
          {/* Show the actual block content in preview */}
          <div style={{ opacity: 0.8 }}>
            {children}
          </div>
          
          {/* Overlay indicator for valid/invalid */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: snapPreview.collision ? '#ff4444' : '#007bc1',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              zIndex: 1000,
            }}
          >
            {snapPreview.collision ? '✗' : '✓'}
          </div>
        </div>
      )}
    </>
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
  onFinalizePosition: PropTypes.func,
  className: PropTypes.string,
  allBlockPositions: PropTypes.object,
};

export default DraggableGridBlock;