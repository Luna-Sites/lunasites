import React, { useState, useRef } from 'react';

/**
 * Block Content Resize Handler Hook
 * Provides resize functionality for block content properties rather than container sizing
 */
export const useBlockContentResize = (data, onChangeBlock, block, config = {}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const resizeStartData = useRef(null);

  // Default configuration for different property types
  const defaultConfig = {
    fontSize: {
      property: 'fontSize',
      defaultValue: 16,
      min: 10,
      max: 72,
      step: 4, // pixels per 4px mouse movement
      directions: ['se', 'ne', 'sw', 'nw'], // corners affect font size
    },
    padding: {
      property: 'padding',
      defaultValue: 12,
      min: 4,
      max: 40,
      step: 8, // pixels per 8px mouse movement
      directions: ['se', 'ne', 'sw', 'nw', 's', 'n'], // corners and vertical edges
    },
    width: {
      property: 'buttonWidth',
      defaultValue: 'auto',
      min: 80,
      max: 400,
      step: 1, // direct pixel mapping
      directions: ['e', 'w'], // horizontal edges only
    },
    height: {
      property: 'buttonHeight',
      defaultValue: 'auto',
      min: 30,
      max: 200,
      step: 1, // direct pixel mapping  
      directions: ['s', 'n'], // vertical edges only
    },
    ...config // Allow override of defaults
  };

  // Check if this block is inside a grid layout
  const isInGrid = React.useMemo(() => {
    return document.querySelector('.grid-layout') !== null;
  }, []);

  const handleResizeStart = (e, direction) => {
    if (!isInGrid) return; // Only allow resize in grid mode
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    
    // Store starting values for all configured properties
    const startValues = {};
    Object.entries(defaultConfig).forEach(([key, propConfig]) => {
      const currentValue = data[propConfig.property];
      if (propConfig.property.includes('Width') || propConfig.property.includes('Height')) {
        // Handle size properties that might be strings like '120px' or 'auto'
        startValues[key] = currentValue === 'auto' ? propConfig.min : parseInt(currentValue) || propConfig.min;
      } else {
        // Handle numeric properties like fontSize, padding
        startValues[key] = currentValue || propConfig.defaultValue;
      }
    });
    
    resizeStartData.current = {
      startX: e.clientX,
      startY: e.clientY,
      startValues
    };
    
    const handleMouseMove = (moveEvent) => {
      if (!resizeStartData.current) return;
      
      const { startX, startY, startValues } = resizeStartData.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newData = { ...data };
      
      // Apply resize based on direction and configured properties
      Object.entries(defaultConfig).forEach(([key, propConfig]) => {
        if (!propConfig.directions.includes(direction)) return;
        
        const { property, min, max, step } = propConfig;
        let delta = 0;
        
        // Determine delta based on direction and property type
        switch (direction) {
          case 'se': // Southeast - positive X and Y
            delta = key === 'width' ? deltaX : (key === 'fontSize' ? deltaX : deltaY);
            break;
          case 'sw': // Southwest - negative X, positive Y  
            delta = key === 'width' ? -deltaX : (key === 'fontSize' ? -deltaX : deltaY);
            break;
          case 'ne': // Northeast - positive X, negative Y
            delta = key === 'width' ? deltaX : (key === 'fontSize' ? deltaX : -deltaY);
            break;
          case 'nw': // Northwest - negative X and Y
            delta = key === 'width' ? -deltaX : (key === 'fontSize' ? -deltaX : -deltaY);
            break;
          case 'e': // East - positive X only
            delta = deltaX;
            break;
          case 'w': // West - negative X only
            delta = -deltaX;
            break;
          case 's': // South - positive Y only
            delta = deltaY;
            break;
          case 'n': // North - negative Y only
            delta = -deltaY;
            break;
        }
        
        // Calculate new value
        const newValue = startValues[key] + Math.round(delta / step);
        const clampedValue = Math.max(min, Math.min(max, newValue));
        
        // Format value based on property type
        if (property.includes('Width') || property.includes('Height')) {
          newData[property] = clampedValue === propConfig.min && propConfig.defaultValue === 'auto' 
            ? 'auto' 
            : `${clampedValue}px`;
        } else {
          newData[property] = clampedValue;
        }
      });
      
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
  };

  return {
    isResizing,
    resizeDirection,
    handleResizeStart,
    isInGrid,
    config: defaultConfig,
  };
};

/**
 * Resize Handle Component
 * Renders individual resize handles with appropriate styling and behavior
 */
export const ResizeHandle = ({ 
  direction, 
  onMouseDown, 
  color = '#e74c3c', 
  title = 'Resize content',
  size = 'normal' // 'normal' | 'small' | 'large'
}) => {
  const isCorner = ['nw', 'ne', 'sw', 'se'].includes(direction);
  const isVertical = ['n', 's'].includes(direction);
  const isHorizontal = ['e', 'w'].includes(direction);
  
  // Size variations
  const sizes = {
    small: { corner: 8, edge: 16 },
    normal: { corner: 12, edge: 24 },
    large: { corner: 16, edge: 32 }
  };
  
  const currentSize = sizes[size];
  
  // Position mapping
  const positions = {
    nw: { top: '-6px', left: '-6px' },
    ne: { top: '-6px', right: '-6px' },
    sw: { bottom: '-6px', left: '-6px' },
    se: { bottom: '-6px', right: '-6px' },
    n: { top: '-4px', left: '50%', transform: 'translateX(-50%)' },
    s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' },
    e: { right: '-4px', top: '50%', transform: 'translateY(-50%)' },
    w: { left: '-4px', top: '50%', transform: 'translateY(-50%)' }
  };
  
  // Cursor mapping
  const cursors = {
    nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
    n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize'
  };
  
  const style = {
    position: 'absolute',
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    cursor: cursors[direction],
    borderRadius: isCorner ? '50%' : '4px',
    zIndex: 20,
    border: '2px solid white',
    boxShadow: `0 2px 8px ${color}66`,
    transition: 'all 0.2s ease',
    width: isCorner ? `${currentSize.corner}px` : isVertical ? `${currentSize.edge}px` : '8px',
    height: isCorner ? `${currentSize.corner}px` : isHorizontal ? `${currentSize.edge}px` : '8px',
    ...positions[direction]
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
  
  const values = Object.entries(config).map(([key, propConfig]) => {
    const value = data[propConfig.property];
    let displayValue = value || propConfig.defaultValue;
    
    // Format display value
    if (typeof displayValue === 'number') {
      displayValue = `${displayValue}px`;
    }
    
    return `${key}: ${displayValue}`;
  }).join(' • ');

  return (
    <div 
      style={{
        position: 'absolute',
        top: '-28px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
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
        textOverflow: 'ellipsis'
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
    fontSize: '#e74c3c',  // Red for font size
    padding: '#f39c12',   // Orange for padding  
    width: '#9b59b6',     // Purple for width
    height: '#27ae60'     // Green for height
  }
}) => {
  const { handleResizeStart, isInGrid, config: resizeConfig } = useBlockContentResize(
    data, 
    onChangeBlock, 
    block, 
    config
  );

  if (!selected || !isInGrid) return null;

  // Get all valid directions from the configuration
  const validDirections = new Set();
  const directionColorMap = {};
  const directionTitleMap = {};
  
  Object.entries(resizeConfig).forEach(([propertyName, propertyConfig]) => {
    const color = colors[propertyName];
    if (color && propertyConfig.directions) {
      propertyConfig.directions.forEach(direction => {
        validDirections.add(direction);
        directionColorMap[direction] = color;
        directionTitleMap[direction] = `Resize ${propertyConfig.title || propertyName}`;
      });
    }
  });

  return (
    <>
      {/* Render only configured resize handles */}
      {Array.from(validDirections).map(direction => (
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
  BlockResizeHandles
};