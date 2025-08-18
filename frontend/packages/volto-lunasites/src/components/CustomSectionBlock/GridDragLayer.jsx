import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const GRID_CONSTANTS = {
  PADDING: 8,
  GAP: 8,
};

const GridDragLayer = ({
  gridConfig,
  children,
  className = '',
}) => {
  const { columns, rowHeight } = gridConfig;
  const [isDragOver, setIsDragOver] = useState(false);
  const [snapPreview, setSnapPreview] = useState(null);
  const layerRef = useRef(null);

  const calculateGridMetrics = useCallback(() => {
    const layer = layerRef.current;
    if (!layer) return null;

    const rect = layer.getBoundingClientRect();
    const availableWidth = rect.width - 2 * GRID_CONSTANTS.PADDING - (columns - 1) * GRID_CONSTANTS.GAP;
    const cellWidth = availableWidth / columns;
    const cellHeight = rowHeight + GRID_CONSTANTS.GAP;

    return { rect, cellWidth, cellHeight };
  }, [columns, rowHeight]);

  const calculateSnapPosition = useCallback((clientX, clientY) => {
    const metrics = calculateGridMetrics();
    if (!metrics) return null;

    const { rect, cellWidth, cellHeight } = metrics;
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    const adjustedX = Math.max(0, relativeX - GRID_CONSTANTS.PADDING);
    const adjustedY = Math.max(0, relativeY - GRID_CONSTANTS.PADDING);

    const gridX = Math.round(adjustedX / cellWidth);
    const gridY = Math.round(adjustedY / cellHeight);

    return { x: gridX, y: gridY };
  }, [calculateGridMetrics]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const handleMouseEnter = () => setIsDragOver(true);
    const handleMouseLeave = () => {
      setIsDragOver(false);
      setSnapPreview(null);
    };

    layer.addEventListener('mouseenter', handleMouseEnter);
    layer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      layer.removeEventListener('mouseenter', handleMouseEnter);
      layer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const containerClassName = cx('grid-drag-layer', className, {
    'drag-over': isDragOver,
  });

  return (
    <div ref={layerRef} className={containerClassName}>
      {children}

      {snapPreview && (
        <div
          className={cx('snap-preview', {
            'collision': snapPreview.collision,
          })}
          style={{
            gridColumn: `${snapPreview.x + 1} / span ${snapPreview.width}`,
            gridRow: `${snapPreview.y + 1} / span ${snapPreview.height}`,
          }}
        >
          {snapPreview.collision ? 'Cannot drop' : 'Drop here'}
        </div>
      )}

      {isDragOver && <div className="drop-indicator" />}
    </div>
  );
};

GridDragLayer.propTypes = {
  gridConfig: PropTypes.shape({
    columns: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
  }).isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default GridDragLayer;
