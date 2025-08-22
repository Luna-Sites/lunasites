import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { unifiedBlockResize, initializeBlockSizing, getDefaultContainerSize } from './utils/contentPropertyCalculator';
import './FreeformGrid.scss';

/**
 * FreeformGrid - Squarespace-style free positioning of blocks
 * 
 * Blocks can be dragged anywhere in the section with pixel-perfect positioning.
 * Features snap-to-guides for easy alignment.
 */
const FreeformGrid = ({
  blocks,
  blocksLayout,
  onUpdateBlockPosition,
  onUpdateBlockSize, // New prop for size updates
  selectedBlock,
  onSelectBlock,
  renderBlock,
  onDeleteBlock,
  className = '',
}) => {
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizedBlock, setResizedBlock] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, handle: null });
  const [guides, setGuides] = useState({ vertical: [], horizontal: [] });
  const [activeGuides, setActiveGuides] = useState({ vertical: null, horizontal: null });
  const containerRef = useRef(null);
  const SNAP_THRESHOLD = 10; // pixels for position snapping
  const POSITION_GRID_SIZE = 10; // Snap position to 10px grid (as percentage)
  const RESIZE_GRID_SIZE = 20; // Snap resize to 20px grid
  const MIN_BLOCK_SIZE = { width: 100, height: 60 }; // Minimum block dimensions in px
  const MAX_BLOCK_SIZE = { width: 800, height: 600 }; // Maximum block dimensions in px

  // Get or initialize position for a block
  const getBlockPosition = useCallback((blockId) => {
    const block = blocks[blockId];
    if (!block) return { x: 0, y: 0 };
    
    // Use stored position or default
    return block.position || { x: 0, y: 0 };
  }, [blocks]);

  // Get or initialize container size for a block
  const getBlockSize = useCallback((blockId) => {
    const block = blocks[blockId];
    if (!block) return { width: 200, height: 150 }; // Default size in px
    
    // Use stored container size or calculate default based on block type
    return block.containerSize || getDefaultContainerSize(block['@type'] || 'text');
  }, [blocks]);

  // Generate alignment guides from all blocks
  const generateGuides = useCallback(() => {
    const verticalGuides = new Set();
    const horizontalGuides = new Set();

    blocksLayout.items.forEach((blockId) => {
      if (blockId === draggedBlock) return; // Skip the dragged block
      
      const pos = getBlockPosition(blockId);
      const elem = document.querySelector(`[data-block-id="${blockId}"]`);
      if (!elem) return;

      const rect = elem.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      // Calculate relative positions
      const relativeLeft = pos.x;
      const relativeRight = pos.x + (rect.width / containerRect.width * 100);
      const relativeTop = pos.y;
      const relativeBottom = pos.y + (rect.height / containerRect.height * 100);
      const relativeCenterX = (relativeLeft + relativeRight) / 2;
      const relativeCenterY = (relativeTop + relativeBottom) / 2;

      // Add guides for edges and center
      verticalGuides.add(relativeLeft);
      verticalGuides.add(relativeRight);
      verticalGuides.add(relativeCenterX);
      
      horizontalGuides.add(relativeTop);
      horizontalGuides.add(relativeBottom);
      horizontalGuides.add(relativeCenterY);
    });

    // Add container edge guides
    verticalGuides.add(0);
    verticalGuides.add(50); // Center
    verticalGuides.add(100);
    
    horizontalGuides.add(0);
    horizontalGuides.add(50); // Center
    horizontalGuides.add(100);

    setGuides({
      vertical: Array.from(verticalGuides),
      horizontal: Array.from(horizontalGuides),
    });
  }, [blocksLayout.items, draggedBlock, getBlockPosition]);

  // Handle drag start
  const handleMouseDown = useCallback((e, blockId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const blockPos = getBlockPosition(blockId);
    
    // Calculate offset from mouse to block position
    const offsetX = (e.clientX - containerRect.left) / containerRect.width * 100 - blockPos.x;
    const offsetY = (e.clientY - containerRect.top) / containerRect.height * 100 - blockPos.y;

    setDraggedBlock(blockId);
    setDragStart({ x: offsetX, y: offsetY });
    onSelectBlock(blockId);
    
    // Generate guides for snapping
    generateGuides();
  }, [getBlockPosition, onSelectBlock, generateGuides]);

  // Handle drag move
  const handleMouseMove = useCallback((e) => {
    if (!draggedBlock || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate new position as percentage
    let newX = (e.clientX - containerRect.left) / containerRect.width * 100 - dragStart.x;
    let newY = (e.clientY - containerRect.top) / containerRect.height * 100 - dragStart.y;

    // Get block dimensions for snapping
    const blockElem = document.querySelector(`[data-block-id="${draggedBlock}"]`);
    if (blockElem) {
      const blockRect = blockElem.getBoundingClientRect();
      const blockWidth = blockRect.width / containerRect.width * 100;
      const blockHeight = blockRect.height / containerRect.height * 100;
      const blockCenterX = newX + blockWidth / 2;
      const blockCenterY = newY + blockHeight / 2;
      const blockRight = newX + blockWidth;
      const blockBottom = newY + blockHeight;

      // Snap to guides
      let snappedX = newX;
      let snappedY = newY;
      let activeVertical = null;
      let activeHorizontal = null;

      // Check vertical guides
      guides.vertical.forEach(guide => {
        // Snap left edge
        if (Math.abs(newX - guide) < SNAP_THRESHOLD * 100 / containerRect.width) {
          snappedX = guide;
          activeVertical = guide;
        }
        // Snap right edge
        if (Math.abs(blockRight - guide) < SNAP_THRESHOLD * 100 / containerRect.width) {
          snappedX = guide - blockWidth;
          activeVertical = guide;
        }
        // Snap center
        if (Math.abs(blockCenterX - guide) < SNAP_THRESHOLD * 100 / containerRect.width) {
          snappedX = guide - blockWidth / 2;
          activeVertical = guide;
        }
      });

      // Check horizontal guides
      guides.horizontal.forEach(guide => {
        // Snap top edge
        if (Math.abs(newY - guide) < SNAP_THRESHOLD * 100 / containerRect.height) {
          snappedY = guide;
          activeHorizontal = guide;
        }
        // Snap bottom edge
        if (Math.abs(blockBottom - guide) < SNAP_THRESHOLD * 100 / containerRect.height) {
          snappedY = guide - blockHeight;
          activeHorizontal = guide;
        }
        // Snap center
        if (Math.abs(blockCenterY - guide) < SNAP_THRESHOLD * 100 / containerRect.height) {
          snappedY = guide - blockHeight / 2;
          activeHorizontal = guide;
        }
      });

      newX = snappedX;
      newY = snappedY;
      setActiveGuides({ vertical: activeVertical, horizontal: activeHorizontal });
    }

    // Constrain to container bounds
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    
    // Snap position to grid for cleaner layouts (unless actively snapping to guides)
    if (!activeGuides.vertical && !activeGuides.horizontal) {
      newX = Math.round(newX / POSITION_GRID_SIZE) * POSITION_GRID_SIZE;
      newY = Math.round(newY / POSITION_GRID_SIZE) * POSITION_GRID_SIZE;
    }

    // Update block position
    onUpdateBlockPosition(draggedBlock, { x: newX, y: newY });
  }, [draggedBlock, dragStart, guides, onUpdateBlockPosition]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setDraggedBlock(null);
    setDragStart({ x: 0, y: 0 });
    setActiveGuides({ vertical: null, horizontal: null });
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e, blockId, handle) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const blockSize = getBlockSize(blockId);
    
    setResizedBlock(blockId);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: blockSize.width,
      height: blockSize.height,
      handle: handle
    });
    onSelectBlock(blockId);
  }, [getBlockSize, onSelectBlock]);

  // Handle resize move with unified system
  const handleResizeMove = useCallback((e) => {
    if (!resizedBlock || !containerRef.current || !onUpdateBlockSize) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    
    // Calculate new dimensions based on resize handle
    switch (resizeStart.handle) {
      case 'bottom-right':
        newWidth = resizeStart.width + deltaX;
        newHeight = resizeStart.height + deltaY;
        break;
      case 'bottom-left':
        newWidth = resizeStart.width - deltaX;
        newHeight = resizeStart.height + deltaY;
        break;
      case 'top-right':
        newWidth = resizeStart.width + deltaX;
        newHeight = resizeStart.height - deltaY;
        break;
      case 'top-left':
        newWidth = resizeStart.width - deltaX;
        newHeight = resizeStart.height - deltaY;
        break;
    }
    
    // Apply constraints
    newWidth = Math.max(MIN_BLOCK_SIZE.width, Math.min(MAX_BLOCK_SIZE.width, newWidth));
    newHeight = Math.max(MIN_BLOCK_SIZE.height, Math.min(MAX_BLOCK_SIZE.height, newHeight));
    
    // Snap to grid for cleaner layouts
    newWidth = Math.round(newWidth / RESIZE_GRID_SIZE) * RESIZE_GRID_SIZE;
    newHeight = Math.round(newHeight / RESIZE_GRID_SIZE) * RESIZE_GRID_SIZE;
    
    // Get current block data
    const currentBlock = blocks[resizedBlock];
    if (!currentBlock) return;
    
    // Use unified resize system to update both container and content
    const updatedBlockData = unifiedBlockResize(currentBlock, {
      width: newWidth,
      height: newHeight
    });
    
    // Update with unified data (container size + content properties)
    onUpdateBlockSize(resizedBlock, updatedBlockData);
  }, [resizedBlock, resizeStart, onUpdateBlockSize, blocks]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setResizedBlock(null);
    setResizeStart({ x: 0, y: 0, width: 0, height: 0, handle: null });
  }, []);

  // Set up global mouse event listeners for dragging
  useEffect(() => {
    if (draggedBlock) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [draggedBlock, handleMouseMove, handleMouseUp]);

  // Set up global mouse event listeners for resizing
  useEffect(() => {
    if (resizedBlock) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.userSelect = '';
      };
    }
  }, [resizedBlock, handleResizeMove, handleResizeEnd]);

  // Handle block selection
  const handleBlockClick = useCallback((e, blockId) => {
    e.stopPropagation();
    if (onSelectBlock) {
      onSelectBlock(blockId);
    }
  }, [onSelectBlock]);

  return (
    <div 
      ref={containerRef}
      className={cx('freeform-grid', className)}
      onClick={() => onSelectBlock(null)} // Deselect when clicking background
    >
      {/* Snap guides */}
      {draggedBlock && (
        <>
          {activeGuides.vertical !== null && (
            <div 
              className="snap-guide vertical active"
              style={{ left: `${activeGuides.vertical}%` }}
            />
          )}
          {activeGuides.horizontal !== null && (
            <div 
              className="snap-guide horizontal active"
              style={{ top: `${activeGuides.horizontal}%` }}
            />
          )}
        </>
      )}

      {/* Render blocks */}
      {blocksLayout.items.map((blockId) => {
        const block = blocks[blockId];
        if (!block) return null;

        const position = getBlockPosition(blockId);
        const size = getBlockSize(blockId);
        const isSelected = selectedBlock === blockId;
        const isDragging = draggedBlock === blockId;
        const isResizing = resizedBlock === blockId;

        return (
          <div
            key={blockId}
            className={cx('freeform-block-wrapper', {
              'selected': isSelected,
              'dragging': isDragging,
              'resizing': isResizing,
            })}
            style={{
              position: 'absolute',
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${size.width}px`,
              height: `${size.height}px`,
              transform: 'translate(0, 0)', // Start from exact position
              cursor: isDragging ? 'grabbing' : isResizing ? 'resizing' : 'grab',
              zIndex: isDragging || isResizing ? 1000 : isSelected ? 100 : 1,
            }}
            onClick={(e) => handleBlockClick(e, blockId)}
            data-block-id={blockId}
          >
            {/* Drag handle - entire block is draggable */}
            <div 
              className="drag-overlay"
              onMouseDown={(e) => handleMouseDown(e, blockId)}
              title="Drag to move"
            />
            
            {/* Delete button when selected */}
            {isSelected && onDeleteBlock && (
              <button
                className="delete-block-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(blockId);
                }}
                aria-label="Delete block"
              >
                ×
              </button>
            )}

            {/* Resize handles when selected */}
            {isSelected && (
              <>
                <div 
                  className="resize-handle top-left" 
                  data-resize="top-left"
                  onMouseDown={(e) => handleResizeStart(e, blockId, 'top-left')}
                />
                <div 
                  className="resize-handle top-right" 
                  data-resize="top-right"
                  onMouseDown={(e) => handleResizeStart(e, blockId, 'top-right')}
                />
                <div 
                  className="resize-handle bottom-left" 
                  data-resize="bottom-left"
                  onMouseDown={(e) => handleResizeStart(e, blockId, 'bottom-left')}
                />
                <div 
                  className="resize-handle bottom-right" 
                  data-resize="bottom-right"
                  onMouseDown={(e) => handleResizeStart(e, blockId, 'bottom-right')}
                />
              </>
            )}

            {/* Size indicator during resize */}
            {isResizing && (
              <div className="size-indicator">
                {Math.round(size.width)} × {Math.round(size.height)}px
                <span className="grid-info"> (Grid: {RESIZE_GRID_SIZE}px)</span>
              </div>
            )}
            
            {/* Block content */}
            <div className="block-content">
              {renderBlock(blockId)}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {blocksLayout.items.length === 0 && (
        <div className="empty-state">
          <p>Click the + button to add blocks</p>
          <p className="hint">Then drag them anywhere you want!</p>
        </div>
      )}
    </div>
  );
};

FreeformGrid.propTypes = {
  blocks: PropTypes.object.isRequired,
  blocksLayout: PropTypes.shape({
    items: PropTypes.array.isRequired,
  }).isRequired,
  onUpdateBlockPosition: PropTypes.func.isRequired,
  onUpdateBlockSize: PropTypes.func, // Prop for unified size/content updates
  selectedBlock: PropTypes.string,
  onSelectBlock: PropTypes.func,
  renderBlock: PropTypes.func.isRequired,
  onDeleteBlock: PropTypes.func,
  className: PropTypes.string,
};

export default FreeformGrid;