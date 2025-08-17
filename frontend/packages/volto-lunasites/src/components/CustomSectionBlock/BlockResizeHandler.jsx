import React, { useState, useRef, useMemo, useCallback } from 'react';

// Default resize configurations - now empty, all configs come from contentResizeConfig.js
const RESIZE_CONFIGS = {};

const DIRECTION_DELTAS = {
  e: (deltaX, deltaY) => deltaX,
  w: (deltaX, deltaY) => -deltaX,
  s: (deltaX, deltaY) => deltaY,
  n: (deltaX, deltaY) => -deltaY,
};

const parseValue = (value, config) => {
  if (config.property.includes('Width') || config.property.includes('Height')) {
    if (value === 'auto' || !value) {
      // Start from a more reasonable default, closer to typical image dimensions
      if (config.property.includes('Width')) {
        return 300; // Reasonable default width
      } else {
        // For height, use a ratio-based approach or smaller default
        return 250; // More reasonable default height
      }
    }
    // Extract numeric value from pixel strings like "200px"
    const numericValue = typeof value === 'string' ? parseInt(value.replace('px', '')) : parseInt(value);
    return numericValue || config.min;
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
  const currentDataRef = useRef(data);
  
  // Update current data ref whenever data changes
  React.useEffect(() => {
    currentDataRef.current = data;
  }, [data]);

  const config = useMemo(
    () => ({ ...RESIZE_CONFIGS, ...customConfig }),
    [customConfig],
  );
  
  // Add stable reference to prevent render loops
  const stableConfig = useMemo(() => config, [JSON.stringify(config)]);

  const isInGrid = useMemo(() => {
    return document.querySelector('.grid-layout') !== null;
  }, []);

  const calculateNewValues = useCallback(
    (startValues, deltaX, deltaY, direction, currentData) => {
      const newData = { ...currentData }; // Use passed current data instead

      Object.entries(stableConfig).forEach(([key, propConfig]) => {
        if (!propConfig.directions.includes(direction)) return;

        const { property, min, max, step } = propConfig;
        const deltaFn = DIRECTION_DELTAS[direction];
        const delta = deltaFn(deltaX, deltaY);
        const newValue = startValues[key] + Math.round(delta / step);
        const clampedValue = Math.max(min, Math.min(max, newValue));

        newData[property] = formatValue(clampedValue, property, propConfig);
      });

      return newData;
    },
    [stableConfig], // Keep without data dependency but pass current data as parameter
  );

  const handleResizeStart = useCallback(
    (e, direction) => {
      if (!isInGrid) return;

      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      setResizeDirection(direction);

      // Find the image element to get its current dimensions
      const imageElement = e.target.closest('.block.image')?.querySelector('img');

      const startValues = {};
      Object.entries(stableConfig).forEach(([key, propConfig]) => {
        const currentValue = data[propConfig.property];
        
        // Special handling for auto dimensions - use actual element size
        if ((currentValue === 'auto' || !currentValue) && imageElement) {
          if (propConfig.property.includes('Width')) {
            startValues[key] = imageElement.offsetWidth;
          } else if (propConfig.property.includes('Height')) {
            startValues[key] = imageElement.offsetHeight;
          } else {
            startValues[key] = parseValue(currentValue, propConfig);
          }
        } else {
          startValues[key] = parseValue(currentValue, propConfig);
        }
        
        console.log(`Resize start - ${key}: current="${currentValue}", start="${startValues[key]}"`);
      });

      resizeStartData.current = {
        startX: e.clientX,
        startY: e.clientY,
        startValues,
      };

      let lastUpdate = 0;
      const handleMouseMove = (moveEvent) => {
        if (!resizeStartData.current) return;
        
        // Throttle updates to prevent render loops
        const now = Date.now();
        if (now - lastUpdate < 8) return; // ~120fps for smoother resize
        lastUpdate = now;

        const { startX, startY, startValues } = resizeStartData.current;
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        const newData = calculateNewValues(
          startValues,
          deltaX,
          deltaY,
          direction,
          currentDataRef.current, // Pass current data
        );
        
        onChangeBlock(block, newData);
        currentDataRef.current = newData; // Update ref with new data immediately
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
    [isInGrid, stableConfig, block, onChangeBlock, calculateNewValues],
  );

  return {
    isResizing,
    resizeDirection,
    handleResizeStart,
    isInGrid,
    config: stableConfig,
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
    zIndex: 999, // Much higher z-index
    border: '2px solid white',
    boxShadow: `0 2px 8px ${color}66`,
    transition: 'all 0.2s ease',
    width: `${width}px`,
    height: `${height}px`,
    ...HANDLE_POSITIONS[direction],
  };

  const handleMouseDown = (e) => {
    onMouseDown(e);
  };

  return (
    <div
      className={`content-resize-handle ${direction}`}
      onMouseDown={handleMouseDown}
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
