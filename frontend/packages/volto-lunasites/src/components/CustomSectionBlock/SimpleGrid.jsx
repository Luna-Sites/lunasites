import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

/**
 * SimpleGrid - A clean, content-aware grid layout with HTML5 drag and drop
 * 
 * This replaces the overcomplicated GridLayout + DraggableGridBlock system
 * with a much simpler approach that lets blocks size themselves naturally.
 */
const SimpleGrid = ({
  blocks,
  blocksLayout,
  onReorderBlocks,
  selectedBlock,
  onSelectBlock,
  renderBlock,
  onDeleteBlock,
  className = '',
}) => {
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [dragOverBlockId, setDragOverBlockId] = useState(null);

  // Handle drag start
  const handleDragStart = useCallback((e, blockId) => {
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
    
    // Add dragging class for visual feedback
    e.target.classList.add('dragging');
  }, []);

  // Handle drag over - prevent default to allow drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drag enter - show drop indicator
  const handleDragEnter = useCallback((e, blockId) => {
    if (blockId !== draggedBlockId) {
      setDragOverBlockId(blockId);
    }
  }, [draggedBlockId]);

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    // Only clear if leaving the grid entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverBlockId(null);
    }
  }, []);

  // Handle drop - reorder blocks
  const handleDrop = useCallback((e, targetBlockId) => {
    e.preventDefault();
    
    const sourceBlockId = e.dataTransfer.getData('text/plain');
    
    if (sourceBlockId && targetBlockId && sourceBlockId !== targetBlockId) {
      // Calculate new order
      const currentOrder = [...blocksLayout.items];
      const sourceIndex = currentOrder.indexOf(sourceBlockId);
      const targetIndex = currentOrder.indexOf(targetBlockId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        // Remove source block
        currentOrder.splice(sourceIndex, 1);
        // Insert at target position
        currentOrder.splice(targetIndex, 0, sourceBlockId);
        
        // Update parent
        onReorderBlocks(currentOrder);
      }
    }
    
    // Clean up
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  }, [blocksLayout.items, onReorderBlocks]);

  // Handle drag end - cleanup
  const handleDragEnd = useCallback((e) => {
    e.target.classList.remove('dragging');
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  }, []);

  // Handle block selection
  const handleBlockClick = useCallback((e, blockId) => {
    e.stopPropagation();
    if (onSelectBlock) {
      onSelectBlock(blockId);
    }
  }, [onSelectBlock]);

  return (
    <div 
      className={cx('simple-grid', className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {blocksLayout.items.map((blockId) => {
        const block = blocks[blockId];
        if (!block) return null;

        const isSelected = selectedBlock === blockId;
        const isDragging = draggedBlockId === blockId;
        const isDragOver = dragOverBlockId === blockId;

        return (
          <div
            key={blockId}
            className={cx('grid-block-wrapper', {
              'selected': isSelected,
              'dragging': isDragging,
              'drag-over': isDragOver,
            })}
            draggable
            onDragStart={(e) => handleDragStart(e, blockId)}
            onDragEnter={(e) => handleDragEnter(e, blockId)}
            onDrop={(e) => handleDrop(e, blockId)}
            onDragEnd={handleDragEnd}
            onClick={(e) => handleBlockClick(e, blockId)}
            data-block-id={blockId}
          >
            {/* Minimal drag handle */}
            <div className="drag-handle" title="Drag to reorder">
              ⋮⋮
            </div>
            
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
            
            {/* Block content - render directly without wrapper */}
            {renderBlock(blockId)}
          </div>
        );
      })}
    </div>
  );
};

SimpleGrid.propTypes = {
  blocks: PropTypes.object.isRequired,
  blocksLayout: PropTypes.shape({
    items: PropTypes.array.isRequired,
  }).isRequired,
  onReorderBlocks: PropTypes.func.isRequired,
  selectedBlock: PropTypes.string,
  onSelectBlock: PropTypes.func,
  renderBlock: PropTypes.func.isRequired,
  onDeleteBlock: PropTypes.func,
  className: PropTypes.string,
};

export default SimpleGrid;