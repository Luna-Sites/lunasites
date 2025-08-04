import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const GRID_CONSTANTS = {
  PADDING: 8,
  GAP: 8,
  DEFAULT_COLUMNS: 12,
  DEFAULT_ROW_HEIGHT: 60,
  CELL_WIDTH_THRESHOLD: 0.3,
  CELL_HEIGHT_THRESHOLD: 0.3,
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
    const gridLayer = document.querySelector('.grid-drag-layer');
    const rect = gridLayer?.getBoundingClientRect();
    const columns = gridConfig.columns || GRID_CONSTANTS.DEFAULT_COLUMNS;
    const rowHeight = gridConfig.rowHeight || GRID_CONSTANTS.DEFAULT_ROW_HEIGHT;

    if (!rect) return null;

    const availableWidth =
      rect.width -
      2 * GRID_CONSTANTS.PADDING -
      (columns - 1) * GRID_CONSTANTS.GAP;
    const cellWidth = availableWidth / columns;
    const cellHeight = rowHeight + GRID_CONSTANTS.GAP;
    const maxX = Math.max(0, columns - position.width);

    return { rect, cellWidth, cellHeight, maxX, columns };
  }, [gridConfig, position.width]);

  const calculateSnapPosition = useCallback((clientX, clientY, metrics) => {
    const { rect, cellWidth, cellHeight, maxX } = metrics;

    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    const adjustedX = Math.max(0, relativeX - GRID_CONSTANTS.PADDING);
    const adjustedY = Math.max(0, relativeY - GRID_CONSTANTS.PADDING);

    const gridX = Math.floor(
      (adjustedX + cellWidth * GRID_CONSTANTS.CELL_WIDTH_THRESHOLD) / cellWidth,
    );
    const gridY = Math.floor(
      (adjustedY + cellHeight * GRID_CONSTANTS.CELL_HEIGHT_THRESHOLD) /
        cellHeight,
    );

    return {
      x: Math.min(Math.max(0, gridX), maxX),
      y: Math.max(0, gridY),
    };
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setSnapPosition(null);
    onEndDrag?.(blockId);
  }, [blockId, onEndDrag]);

  const handleMouseDown = useCallback(
    (e) => {
      if (!e.target.closest('.drag-handle')) {
        if (onSelect && !selected) {
          onSelect(blockId);
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const metrics = calculateGridMetrics();
      if (!metrics) return;

      setIsDragging(true);
      originalPosition.current = position;
      onStartDrag?.(blockId);

      let lastSnapPosition = { x: position.x, y: position.y };

      const handleMouseMove = (moveEvent) => {
        const snapPos = calculateSnapPosition(
          moveEvent.clientX,
          moveEvent.clientY,
          metrics,
        );

        if (
          snapPos.x !== lastSnapPosition.x ||
          snapPos.y !== lastSnapPosition.y
        ) {
          lastSnapPosition = snapPos;
          setSnapPosition(snapPos);
          onTempPositionUpdate?.(blockId, { ...position, ...snapPos });
        }
      };

      const handleMouseUp = (upEvent) => {
        // Calculate final position and use direct callback
        const finalSnapPos = calculateSnapPosition(
          upEvent.clientX,
          upEvent.clientY,
          metrics,
        );
        const finalPosition = { ...position, ...finalSnapPos };

        // Use the clean callback approach
        onFinalizePosition?.(blockId, finalPosition);

        handleDragEnd();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
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
