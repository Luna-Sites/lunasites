import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const GRID_CONSTANTS = {
  PADDING: 8,
  GAP: 8,
  DEFAULT_COLUMNS: 12,
  DEFAULT_ROW_HEIGHT: 60,
  CELL_WIDTH_THRESHOLD: 0.2, // Reduced for more responsive snapping
  CELL_HEIGHT_THRESHOLD: 0.2, // Reduced for more responsive snapping
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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [snapPosition, setSnapPosition] = useState(null);
  const originalPosition = useRef(null);

  const calculateGridMetrics = useCallback(() => {
    // Try multiple selectors to find the grid container
    const gridLayer = document.querySelector('.grid-drag-layer') || 
                     document.querySelector('.grid-layout') ||
                     document.querySelector('[class*="grid"]');
    
    if (!gridLayer) {
      console.warn('Grid container not found, falling back to defaults');
      return null;
    }

    const rect = gridLayer.getBoundingClientRect();
    const columns = gridConfig.columns || GRID_CONSTANTS.DEFAULT_COLUMNS;
    const rowHeight = gridConfig.rowHeight || GRID_CONSTANTS.DEFAULT_ROW_HEIGHT;

    if (!rect || rect.width === 0 || rect.height === 0) {
      console.warn('Grid container has zero dimensions');
      return null;
    }

    const availableWidth =
      rect.width -
      2 * GRID_CONSTANTS.PADDING -
      (columns - 1) * GRID_CONSTANTS.GAP;
    const cellWidth = Math.max(1, availableWidth / columns); // Ensure positive width
    const cellHeight = rowHeight + GRID_CONSTANTS.GAP;
    const maxX = Math.max(0, columns - position.width);

    return { rect, cellWidth, cellHeight, maxX, columns };
  }, [gridConfig, position.width]);

  const calculateSnapPosition = useCallback((clientX, clientY, metrics) => {
    const { rect, cellWidth, cellHeight, maxX, columns } = metrics;

    // Calculate position relative to the grid container
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // Account for grid padding and ensure we're within bounds
    const adjustedX = Math.max(0, Math.min(rect.width - GRID_CONSTANTS.PADDING, relativeX - GRID_CONSTANTS.PADDING));
    const adjustedY = Math.max(0, relativeY - GRID_CONSTANTS.PADDING);

    // Calculate grid position with improved snapping
    // Use rounding instead of floor for more natural snapping behavior
    const exactGridX = adjustedX / cellWidth;
    const exactGridY = adjustedY / cellHeight;
    
    // Apply threshold-based snapping for more intuitive behavior
    const gridX = Math.round(exactGridX - GRID_CONSTANTS.CELL_WIDTH_THRESHOLD + 0.5);
    const gridY = Math.round(exactGridY - GRID_CONSTANTS.CELL_HEIGHT_THRESHOLD + 0.5);

    // Ensure the block stays within grid bounds
    const clampedX = Math.min(Math.max(0, gridX), maxX);
    const clampedY = Math.max(0, gridY);

    return {
      x: clampedX,
      y: clampedY,
    };
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setSnapPosition(null);
    onEndDrag?.(blockId);
  }, [blockId, onEndDrag]);

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

      setIsDragging(true);
      originalPosition.current = position;
      onStartDrag?.(blockId);

      let lastSnapPosition = { x: position.x, y: position.y };

      const handleMouseMove = (moveEvent) => {
        try {
          const snapPos = calculateSnapPosition(
            moveEvent.clientX,
            moveEvent.clientY,
            metrics,
          );

          if (
            snapPos &&
            (snapPos.x !== lastSnapPosition.x ||
             snapPos.y !== lastSnapPosition.y)
          ) {
            lastSnapPosition = snapPos;
            setSnapPosition(snapPos);
            onTempPositionUpdate?.(blockId, { ...position, ...snapPos });
          }
        } catch (error) {
          console.warn('Error during drag move:', error);
        }
      };

      const handleMouseUp = (upEvent) => {
        try {
          // Calculate final position and use direct callback
          const finalSnapPos = calculateSnapPosition(
            upEvent.clientX,
            upEvent.clientY,
            metrics,
          );
          
          if (finalSnapPos) {
            const finalPosition = { ...position, ...finalSnapPos };
            onFinalizePosition?.(blockId, finalPosition);
          } else {
            // Fallback to original position if snap calculation fails
            onFinalizePosition?.(blockId, originalPosition.current || position);
          }
        } catch (error) {
          console.warn('Error during drag end:', error);
          // Fallback to original position
          onFinalizePosition?.(blockId, originalPosition.current || position);
        } finally {
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
      onTempPositionUpdate,
      onFinalizePosition,
      handleDragEnd,
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

  return (
    <div
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
};

export default DraggableGridBlock;
