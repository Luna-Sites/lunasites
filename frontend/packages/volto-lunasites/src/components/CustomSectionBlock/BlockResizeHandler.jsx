import React, { useState, useRef, useMemo, useCallback } from 'react';

const RESIZE_CONFIGS = {
  padding: {
    property: 'padding',
    defaultValue: 12,
    min: 4,
    max: 40,
    step: 8,
    directions: ['s', 'n'],
  },
  width: {
    property: 'buttonWidth',
    defaultValue: 'auto',
    min: 80,
    max: 400,
    step: 1,
    directions: ['e', 'w'],
  },
  height: {
    property: 'buttonHeight',
    defaultValue: 'auto',
    min: 30,
    max: 200,
    step: 1,
    directions: ['s', 'n'],
  },
};

const DIRECTION_DELTAS = {
  e: (deltaX) => deltaX,
  w: (deltaX) => -deltaX,
  s: (deltaX, deltaY) => deltaY,
  n: (deltaX, deltaY) => -deltaY,
};

const parseValue = (value, config) => {
  if (config.property.includes('Width') || config.property.includes('Height')) {
    return value === 'auto' ? config.min : parseInt(value) || config.min;
  }
  return value || config.defaultValue;
};

const formatValue = (value, property, config) => {
  if (property.includes('Width') || property.includes('Height')) {
    return value === config.min && config.defaultValue === 'auto'
      ? 'auto'
      : `${value}px`;
  }
  return value;
};

export const useBlockContentResize = (
  data,
  onChangeBlock,
  block,
  customConfig = {},
) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const resizeStartData = useRef(null);

  const config = useMemo(
    () => ({ ...RESIZE_CONFIGS, ...customConfig }),
    [customConfig],
  );

  const isInGrid = useMemo(() => {
    return document.querySelector('.grid-layout') !== null;
  }, []);

  const calculateNewValues = useCallback(
    (startValues, deltaX, deltaY, direction) => {
      const newData = { ...data };

      Object.entries(config).forEach(([key, propConfig]) => {
        if (!propConfig.directions.includes(direction)) return;

        const { property, min, max, step } = propConfig;
        const deltaFn = DIRECTION_DELTAS[direction];
        const delta = deltaFn(deltaX, deltaY, key);
        const newValue = startValues[key] + Math.round(delta / step);
        const clampedValue = Math.max(min, Math.min(max, newValue));

        newData[property] = formatValue(clampedValue, property, propConfig);
      });

      return newData;
    },
    [config, data],
  );

  const handleResizeStart = useCallback(
    (e, direction) => {
      if (!isInGrid) return;

      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setResizeDirection(direction);

      const startValues = {};
      Object.entries(config).forEach(([key, propConfig]) => {
        startValues[key] = parseValue(data[propConfig.property], propConfig);
      });

      resizeStartData.current = {
        startX: e.clientX,
        startY: e.clientY,
        startValues,
      };

      const handleMouseMove = (moveEvent) => {
        if (!resizeStartData.current) return;

        const { startX, startY, startValues } = resizeStartData.current;
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        const newData = calculateNewValues(
          startValues,
          deltaX,
          deltaY,
          direction,
        );
        onChangeBlock(block, newData);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        setResizeDirection(null);
        resizeStartData.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [isInGrid, config, data, block, onChangeBlock, calculateNewValues],
  );

  return {
    isResizing,
    resizeDirection,
    handleResizeStart,
    isInGrid,
    config,
  };
};

const HANDLE_POSITIONS = {
  n: { top: '-4px', left: '50%', transform: 'translateX(-50%)' },
  s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' },
  e: { right: '-4px', top: '50%', transform: 'translateY(-50%)' },
  w: { left: '-4px', top: '50%', transform: 'translateY(-50%)' },
};

const HANDLE_CURSORS = {
  n: 'n-resize',
  s: 's-resize',
  e: 'e-resize',
  w: 'w-resize',
};

const HANDLE_SIZES = {
  small: { edge: 16 },
  normal: { edge: 24 },
  large: { edge: 32 },
};

export const ResizeHandle = ({
  direction,
  onMouseDown,
  color = '#e74c3c',
  title = 'Resize content',
  size = 'normal',
}) => {
  const isVertical = /^[ns]$/.test(direction);
  const currentSize = HANDLE_SIZES[size];

  const getDimensions = () => {
    if (isVertical) return [currentSize.edge, 8];
    return [8, currentSize.edge];
  };

  const [width, height] = getDimensions();

  const style = {
    position: 'absolute',
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    cursor: HANDLE_CURSORS[direction],
    borderRadius: '4px',
    zIndex: 20,
    border: '2px solid white',
    boxShadow: `0 2px 8px ${color}66`,
    transition: 'all 0.2s ease',
    width: `${width}px`,
    height: `${height}px`,
    ...HANDLE_POSITIONS[direction],
  };

  return (
    <div
      className={`content-resize-handle ${direction}`}
      onMouseDown={onMouseDown}
      style={style}
      title={title}
    />
  );
};

/**
 * Resize Info Display Component
 * Shows current values during resize operations
 */
export const ResizeInfo = ({ data, config, selected, isInGrid }) => {
  if (!selected || !isInGrid) return null;

  const values = Object.entries(config)
    .map(([key, propConfig]) => {
      const value = data[propConfig.property];
      let displayValue = value || propConfig.defaultValue;

      // Format display value
      if (typeof displayValue === 'number') {
        displayValue = `${displayValue}px`;
      }

      return `${key}: ${displayValue}`;
    })
    .join(' • ');

  return (
    <div
      style={{
        position: 'absolute',
        top: '-28px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        background:
          'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        pointerEvents: 'none',
        fontFamily: 'monospace',
        fontWeight: '500',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        whiteSpace: 'nowrap',
        maxWidth: '250px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      Content: {values}
    </div>
  );
};

/**
 * Complete Resize Handles Component
 * Renders all resize handles for a block with the given configuration
 */
export const BlockResizeHandles = ({
  data,
  onChangeBlock,
  block,
  selected,
  config = {},
  colors = {
    padding: '#f39c12',
    width: '#9b59b6',
    height: '#27ae60',
  },
}) => {
  const {
    handleResizeStart,
    isInGrid,
    config: resizeConfig,
  } = useBlockContentResize(data, onChangeBlock, block, config);

  if (!selected || !isInGrid) return null;

  // Get all valid directions from the configuration
  const validDirections = new Set();
  const directionColorMap = {};
  const directionTitleMap = {};

  Object.entries(resizeConfig).forEach(([propertyName, propertyConfig]) => {
    const color = colors[propertyName];
    if (color && propertyConfig.directions) {
      propertyConfig.directions.forEach((direction) => {
        validDirections.add(direction);
        directionColorMap[direction] = color;
        directionTitleMap[direction] = `Resize ${
          propertyConfig.title || propertyName
        }`;
      });
    }
  });

  return (
    <>
      {/* Render only configured resize handles */}
      {Array.from(validDirections).map((direction) => (
        <ResizeHandle
          key={direction}
          direction={direction}
          onMouseDown={(e) => handleResizeStart(e, direction)}
          color={directionColorMap[direction]}
          title={directionTitleMap[direction]}
        />
      ))}

      {/* Resize info display */}
      <ResizeInfo
        data={data}
        config={resizeConfig}
        selected={selected}
        isInGrid={isInGrid}
      />
    </>
  );
};

export default {
  useBlockContentResize,
  ResizeHandle,
  ResizeInfo,
  BlockResizeHandles,
};
