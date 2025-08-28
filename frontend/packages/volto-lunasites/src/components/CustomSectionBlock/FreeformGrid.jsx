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
  const [containerHeight, setContainerHeight] = useState(500); // Dynamic height state
  const containerRef = useRef(null);
  const SNAP_THRESHOLD = 10; // pixels for position snapping
  const POSITION_GRID_SIZE = 10; // Snap position to 10px grid (as percentage)
  const RESIZE_GRID_SIZE = 20; // Snap resize to 20px grid
  const MIN_BLOCK_SIZE = { width: 100, height: 60 }; // Minimum block dimensions in px
  const MIN_CONTAINER_HEIGHT = 400; // Minimum container height
  const CONTAINER_PADDING_BOTTOM = 100; // Padding below the lowest block

  // Get or initialize position for a block (in pixels, not percentages)
  const getBlockPosition = useCallback((blockId) => {
    const block = blocks[blockId];
    if (!block) return { x: 0, y: 0 };
    
    // Position is stored in pixels to avoid movement when container resizes
    return block.position || { x: 0, y: 0 };
  }, [blocks]);

  // Get or initialize container size for a block
  const getBlockSize = useCallback((blockId) => {
    const block = blocks[blockId];
    if (!block) return { width: 200, height: 150 }; // Default size in px
    
    // Use stored container size if available
    if (block.containerSize) {
      return block.containerSize;
    }
    
    // Get default size based on block type
    const defaultSize = getDefaultContainerSize(block['@type'] || 'text');
    
    // For images without a size, try to get the actual image dimensions
    if (!defaultSize && block['@type'] === 'image') {
      // Try to find the image element to get its natural size
      const imageElement = document.querySelector(`[data-block-id="${blockId}"] img`);
      if (imageElement && imageElement.naturalWidth) {
        // Use natural dimensions but cap at reasonable max size
        return {
          width: Math.min(imageElement.naturalWidth, 600),
          height: Math.min(imageElement.naturalHeight, 400)
        };
      }
      // Fallback for images
      return { width: 300, height: 200 };
    }
    
    return defaultSize || { width: 200, height: 150 };
  }, [blocks]);

  /**
   * Calculate optimal container height based on block positions
   * Finds the lowest block and adds padding
   */
  const calculateContainerHeight = useCallback(() => {
    let maxBottom = 0;
    
    // Find the lowest positioned block
    blocksLayout.items.forEach(blockId => {
      const block = blocks[blockId];
      if (block?.position) {
        // Position is now in pixels
        const blockTop = block.position.y || 0;
        const blockSize = getBlockSize(blockId);
        
        // For text blocks, try to get actual rendered height
        const isTextBlock = block['@type'] === 'text' || block['@type'] === 'slate' || block['@type'] === 'description';
        let blockHeight = blockSize?.height || 100;
        
        if (isTextBlock && containerRef.current) {
          const blockElement = containerRef.current.querySelector(`[data-block-id="${blockId}"]`);
          if (blockElement) {
            // Get the actual rendered height including all content
            const actualHeight = blockElement.scrollHeight || blockElement.offsetHeight;
            blockHeight = Math.max(actualHeight, blockHeight);
          }
        }
        
        const blockBottom = blockTop + blockHeight;
        
        // Update max bottom if this block is lower
        if (blockBottom > maxBottom) {
          maxBottom = blockBottom;
        }
      }
    });
    
    // Add padding and ensure minimum height
    return Math.max(MIN_CONTAINER_HEIGHT, maxBottom + CONTAINER_PADDING_BOTTOM);
  }, [blocks, blocksLayout.items, getBlockSize]);

  // Update container height when blocks change
  useEffect(() => {
    const newHeight = calculateContainerHeight();
    if (Math.abs(newHeight - containerHeight) > 10) { // Only update if significant change
      setContainerHeight(newHeight);
    }
  }, [blocks, blocksLayout.items, calculateContainerHeight, containerHeight]);
  
  // Watch for text content changes with MutationObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new MutationObserver(() => {
      // Recalculate container height when text content changes
      const newHeight = calculateContainerHeight();
      if (Math.abs(newHeight - containerHeight) > 10) {
        setContainerHeight(newHeight);
      }
    });
    
    // Observe all text blocks for changes
    blocksLayout.items.forEach(blockId => {
      const block = blocks[blockId];
      const isTextBlock = block?.['@type'] === 'text' || block?.['@type'] === 'slate' || block?.['@type'] === 'description';
      
      if (isTextBlock) {
        const blockElement = containerRef.current.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
          observer.observe(blockElement, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          });
        }
      }
    });
    
    return () => observer.disconnect();
  }, [blocks, blocksLayout.items, calculateContainerHeight, containerHeight]);

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

      // Calculate positions in pixels
      const left = pos.x;
      const right = pos.x + rect.width;
      const top = pos.y;
      const bottom = pos.y + rect.height;
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;

      // Add guides for edges and center (in pixels)
      verticalGuides.add(left);
      verticalGuides.add(right);
      verticalGuides.add(centerX);
      
      horizontalGuides.add(top);
      horizontalGuides.add(bottom);
      horizontalGuides.add(centerY);
    });

    // Add container edge guides (in pixels)
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      verticalGuides.add(0);
      verticalGuides.add(containerRect.width / 2); // Center
      verticalGuides.add(containerRect.width);
      
      horizontalGuides.add(0);
      horizontalGuides.add(containerHeight / 2); // Center
      horizontalGuides.add(containerHeight);
    }

    setGuides({
      vertical: Array.from(verticalGuides),
      horizontal: Array.from(horizontalGuides),
    });
  }, [blocksLayout.items, draggedBlock, getBlockPosition, containerHeight]);

  // Handle drag start
  const handleMouseDown = useCallback((e, blockId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const blockPos = getBlockPosition(blockId);
    
    // Calculate offset from mouse to block position (in pixels)
    const offsetX = (e.clientX - containerRect.left) - blockPos.x;
    const offsetY = (e.clientY - containerRect.top) - blockPos.y;

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
    
    // Calculate new position in pixels
    let newX = (e.clientX - containerRect.left) - dragStart.x;
    let newY = (e.clientY - containerRect.top) - dragStart.y;

    // Get block dimensions for snapping
    const blockElem = document.querySelector(`[data-block-id="${draggedBlock}"]`);
    if (blockElem) {
      const blockRect = blockElem.getBoundingClientRect();
      const blockWidth = blockRect.width;
      const blockHeight = blockRect.height;
      const blockCenterX = newX + blockWidth / 2;
      const blockCenterY = newY + blockHeight / 2;
      const blockRight = newX + blockWidth;
      const blockBottom = newY + blockHeight;

      // Snap to guides
      let snappedX = newX;
      let snappedY = newY;
      let activeVertical = null;
      let activeHorizontal = null;

      // Check vertical guides (in pixels)
      guides.vertical.forEach(guide => {
        // Snap left edge
        if (Math.abs(newX - guide) < SNAP_THRESHOLD) {
          snappedX = guide;
          activeVertical = guide;
        }
        // Snap right edge
        if (Math.abs(blockRight - guide) < SNAP_THRESHOLD) {
          snappedX = guide - blockWidth;
          activeVertical = guide;
        }
        // Snap center
        if (Math.abs(blockCenterX - guide) < SNAP_THRESHOLD) {
          snappedX = guide - blockWidth / 2;
          activeVertical = guide;
        }
      });

      // Check horizontal guides (in pixels)
      guides.horizontal.forEach(guide => {
        // Snap top edge
        if (Math.abs(newY - guide) < SNAP_THRESHOLD) {
          snappedY = guide;
          activeHorizontal = guide;
        }
        // Snap bottom edge
        if (Math.abs(blockBottom - guide) < SNAP_THRESHOLD) {
          snappedY = guide - blockHeight;
          activeHorizontal = guide;
        }
        // Snap center
        if (Math.abs(blockCenterY - guide) < SNAP_THRESHOLD) {
          snappedY = guide - blockHeight / 2;
          activeHorizontal = guide;
        }
      });

      newX = snappedX;
      newY = snappedY;
      setActiveGuides({ vertical: activeVertical, horizontal: activeHorizontal });
    }

    // Get block dimensions in pixels
    let blockWidthPx = 0;
    let blockHeightPx = 0;
    
    if (blockElem) {
      const blockRect = blockElem.getBoundingClientRect();
      blockWidthPx = blockRect.width;
      blockHeightPx = blockRect.height;
    }
    
    // Calculate if block would extend past current container bottom
    const blockBottomPx = newY + blockHeightPx;
    const neededHeight = blockBottomPx + CONTAINER_PADDING_BOTTOM;
    
    // Dynamically expand container if needed
    if (neededHeight > containerHeight) {
      setContainerHeight(neededHeight);
    }
    
    // Constrain to container bounds (in pixels)
    const maxX = Math.max(0, containerRect.width - blockWidthPx);
    const maxY = Math.max(0, containerHeight - blockHeightPx);
    
    newX = Math.max(0, Math.min(maxX, newX));
    newY = Math.max(0, Math.min(maxY, newY));
    
    // Snap position to grid for cleaner layouts (unless actively snapping to guides)
    if (!activeGuides.vertical && !activeGuides.horizontal) {
      newX = Math.round(newX / POSITION_GRID_SIZE) * POSITION_GRID_SIZE;
      newY = Math.round(newY / POSITION_GRID_SIZE) * POSITION_GRID_SIZE;
    }

    // Update block position (in pixels)
    onUpdateBlockPosition(draggedBlock, { x: newX, y: newY });
  }, [draggedBlock, dragStart, guides, onUpdateBlockPosition, containerHeight]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setDraggedBlock(null);
    setDragStart({ x: 0, y: 0 });
    setActiveGuides({ vertical: null, horizontal: null });
    
    // Recalculate container height after drag to potentially shrink
    setTimeout(() => {
      const newHeight = calculateContainerHeight();
      setContainerHeight(newHeight);
    }, 0);
  }, [calculateContainerHeight]);

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
    
    // Get current block position to check boundaries
    const currentBlock = blocks[resizedBlock];
    if (!currentBlock) return;
    
    const position = currentBlock.position || { x: 0, y: 0 };
    
    // Calculate maximum allowed size based on position (position is in pixels)
    // Block should not extend beyond container bounds
    const maxWidthFromPosition = containerRect.width - position.x;
    const maxHeightFromPosition = containerHeight - position.y;
    
    // Check if resize would extend past container bottom
    const blockBottomPx = position.y + newHeight;
    const neededHeight = blockBottomPx + CONTAINER_PADDING_BOTTOM;
    
    // Dynamically expand container if needed
    if (neededHeight > containerHeight) {
      setContainerHeight(neededHeight);
    }
    
    // Apply constraints including position-based limits
    newWidth = Math.max(MIN_BLOCK_SIZE.width, Math.min(maxWidthFromPosition, newWidth));
    newHeight = Math.max(MIN_BLOCK_SIZE.height, Math.min(maxHeightFromPosition, newHeight));
    
    // Snap to grid for cleaner layouts
    newWidth = Math.round(newWidth / RESIZE_GRID_SIZE) * RESIZE_GRID_SIZE;
    newHeight = Math.round(newHeight / RESIZE_GRID_SIZE) * RESIZE_GRID_SIZE;
    
    // Check if this is a text block - they should only resize width
    const isTextBlock = currentBlock['@type'] === 'text' || 
                       currentBlock['@type'] === 'slate' || 
                       currentBlock['@type'] === 'description';
    
    if (isTextBlock) {
      // Text blocks only resize width - height is determined by content
      onUpdateBlockSize(resizedBlock, {
        containerSize: {
          width: newWidth,
          // Don't set height for text blocks - let content determine it
          height: null
        }
      });
    } else if (currentBlock['@type'] === 'image') {
      // Images just update the containerSize directly
      onUpdateBlockSize(resizedBlock, {
        containerSize: {
          width: newWidth,
          height: newHeight
        }
      });
    } else {
      // For other blocks, use unified resize system
      const updatedBlockData = unifiedBlockResize(currentBlock, {
        width: newWidth,
        height: newHeight
      });
      
      // Update with unified data (container size + content properties)
      onUpdateBlockSize(resizedBlock, updatedBlockData);
    }
  }, [resizedBlock, resizeStart, onUpdateBlockSize, blocks, containerHeight]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setResizedBlock(null);
    setResizeStart({ x: 0, y: 0, width: 0, height: 0, handle: null });
    
    // Recalculate container height after resize to potentially shrink
    setTimeout(() => {
      const newHeight = calculateContainerHeight();
      setContainerHeight(newHeight);
    }, 0);
  }, [calculateContainerHeight]);

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
      style={{
        minHeight: `${containerHeight}px`,
        transition: 'min-height 0.3s ease',
      }}
      onClick={() => onSelectBlock(null)} // Deselect when clicking background
    >
      {/* Snap guides */}
      {draggedBlock && (
        <>
          {activeGuides.vertical !== null && (
            <div 
              className="snap-guide vertical active"
              style={{ left: `${activeGuides.vertical}px` }}
            />
          )}
          {activeGuides.horizontal !== null && (
            <div 
              className="snap-guide horizontal active"
              style={{ top: `${activeGuides.horizontal}px` }}
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
        
        // Check if block has been explicitly sized (for images especially)
        const hasExplicitSize = block.containerSize || (block['@type'] !== 'image');
        
        // Check if image block has content
        const isEmptyImageBlock = block['@type'] === 'image' && !block.url;
        
        // Check if it's a text-type block
        const isTextBlock = block['@type'] === 'text' || block['@type'] === 'slate' || block['@type'] === 'description';

        return (
          <div
            key={blockId}
            className={cx('freeform-block-wrapper', {
              'selected': isSelected,
              'dragging': isDragging,
              'resizing': isResizing,
              'empty-image': isEmptyImageBlock,
              'has-text-block': isTextBlock,
            })}
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`,
              // Only apply explicit dimensions if block has been sized
              ...(hasExplicitSize && {
                width: `${size.width}px`,
                // For text blocks, let height be auto
                ...(isTextBlock ? {} : { height: `${size.height}px` }),
              }),
              transform: 'translate(0, 0)', // Start from exact position
              cursor: isDragging ? 'grabbing' : isResizing ? 'resizing' : 'grab',
              zIndex: isDragging || isResizing ? 1000 : isSelected ? 100 : 1,
            }}
            onClick={(e) => handleBlockClick(e, blockId)}
            data-block-id={blockId}
          >
            {/* Dedicated drag handle for text blocks */}
            {(block['@type'] === 'text' || block['@type'] === 'slate' || block['@type'] === 'description') && (
              <div 
                className="text-drag-handle"
                onMouseDown={(e) => handleMouseDown(e, blockId)}
                title="Drag to move"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="4" cy="4" r="1.5"/>
                  <circle cx="12" cy="4" r="1.5"/>
                  <circle cx="4" cy="8" r="1.5"/>
                  <circle cx="12" cy="8" r="1.5"/>
                  <circle cx="4" cy="12" r="1.5"/>
                  <circle cx="12" cy="12" r="1.5"/>
                </svg>
              </div>
            )}
            
            {/* Regular drag overlay for non-text blocks */}
            {(block['@type'] !== 'text' && block['@type'] !== 'slate' && block['@type'] !== 'description') && 
             (isSelected || block['@type'] !== 'image' || block.url) && (
              <div 
                className="drag-overlay"
                onMouseDown={(e) => handleMouseDown(e, blockId)}
                title="Drag to move"
              />
            )}
            
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

            {/* Resize handles when selected - only horizontal for text blocks */}
            {isSelected && (
              <>
                {/* For text blocks, only show left/right handles for width resize */}
                {isTextBlock ? (
                  <>
                    <div 
                      className="resize-handle left" 
                      data-resize="left"
                      onMouseDown={(e) => handleResizeStart(e, blockId, 'left')}
                      style={{
                        position: 'absolute',
                        left: '-4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '8px',
                        height: '30px',
                        cursor: 'ew-resize',
                        background: 'rgba(0, 123, 193, 0.3)',
                        borderRadius: '2px'
                      }}
                    />
                    <div 
                      className="resize-handle right" 
                      data-resize="right"
                      onMouseDown={(e) => handleResizeStart(e, blockId, 'right')}
                      style={{
                        position: 'absolute',
                        right: '-4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '8px',
                        height: '30px',
                        cursor: 'ew-resize',
                        background: 'rgba(0, 123, 193, 0.3)',
                        borderRadius: '2px'
                      }}
                    />
                  </>
                ) : (
                  // For non-text blocks, show corner handles
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