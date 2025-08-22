import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { migrateBlockToGrid, hasGridProperties, resolveGridOverlaps } from './utils/gridMigration';
import './Grid12Layout.scss';

/**
 * Grid12Layout - 12-column CSS Grid layout system
 * 
 * Responsive grid that maintains layout across screen sizes and zoom levels.
 * Blocks snap to grid cells with visual feedback.
 */
const Grid12Layout = ({
  blocks,
  blocksLayout,
  onUpdateBlock,
  selectedBlock,
  onSelectBlock,
  renderBlock,
  onDeleteBlock,
  showGridOverlay = true,
  gridGap = 16,
  className = '',
}) => {
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [resizingBlock, setResizingBlock] = useState(null);
  const [resizePreview, setResizePreview] = useState(null);
  const containerRef = useRef(null);
  
  // Grid configuration
  const GRID_COLUMNS = 12;
  const MIN_ROW_HEIGHT = 60;
  const MIN_COLUMN_SPAN = 1;
  const MAX_COLUMN_SPAN = 12;
  const MIN_ROW_SPAN = 1;
  
  // Calculate maximum rows based on blocks
  const calculateMaxRows = useCallback(() => {
    let maxRow = 0;
    blocksLayout.items.forEach(blockId => {
      const block = blocks[blockId];
      if (block && hasGridProperties(block)) {
        const endRow = (block.gridRow || 1) + (block.rowSpan || 1) - 1;
        maxRow = Math.max(maxRow, endRow);
      }
    });
    return Math.max(maxRow, 10); // Minimum 10 rows for plenty of space
  }, [blocks, blocksLayout.items]);
  
  const maxRows = calculateMaxRows();
  
  // Ensure all blocks have grid properties
  const getBlockGridProps = useCallback((blockId) => {
    const block = blocks[blockId];
    if (!block) return null;
    
    // If block already has grid properties, use them
    if (hasGridProperties(block)) {
      return {
        gridColumn: block.gridColumn,
        gridRow: block.gridRow,
        columnSpan: block.columnSpan || 3,
        rowSpan: block.rowSpan || 1,
      };
    }
    
    // Otherwise, migrate from pixel position or use defaults
    const containerWidth = containerRef.current?.offsetWidth || 1200;
    const migrated = migrateBlockToGrid(block, containerWidth);
    
    // Update block with migrated properties (async)
    if (onUpdateBlock) {
      setTimeout(() => {
        onUpdateBlock(blockId, migrated);
      }, 0);
    }
    
    return {
      gridColumn: migrated.gridColumn || 1,
      gridRow: migrated.gridRow || 1,
      columnSpan: migrated.columnSpan || 3,
      rowSpan: migrated.rowSpan || 1,
    };
  }, [blocks, onUpdateBlock]);
  
  // Handle drag start - simple and direct
  const handleMouseDown = useCallback((e, blockId) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Just record what we're dragging
    setDraggedBlockId(blockId);
    onSelectBlock(blockId);
    
    // Visual feedback
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [onSelectBlock]);
  
  // Handle mouse move - fixed calculation for CSS Grid with gaps
  const handleMouseMove = useCallback((e) => {
    if (!draggedBlockId || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Get computed styles to ensure we're using actual rendered values
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || gridGap;
    const paddingTop = parseFloat(computedStyle.paddingTop) || (gridGap + 32);
    const paddingRight = parseFloat(computedStyle.paddingRight) || gridGap;
    
    // Mouse position relative to container content area
    const mouseX = e.clientX - rect.left - paddingLeft;
    const mouseY = e.clientY - rect.top - paddingTop;
    
    // Grid dimensions
    const gridWidth = rect.width - paddingLeft - paddingRight;
    const gridHeight = rect.height - paddingTop - parseFloat(computedStyle.paddingBottom);
    
    // Calculate cell dimensions in CSS Grid with gaps
    // Formula: gridWidth = columns * cellWidth + (columns - 1) * gap
    // Solving for cellWidth: cellWidth = (gridWidth - (columns - 1) * gap) / columns
    const totalGaps = gridGap * (GRID_COLUMNS - 1);
    const cellWidth = (gridWidth - totalGaps) / GRID_COLUMNS;
    
    // Calculate column position
    let gridColumn = 1;
    let accumulated = 0;
    
    for (let col = 1; col <= GRID_COLUMNS; col++) {
      const cellStart = accumulated;
      const cellEnd = cellStart + cellWidth;
      
      if (mouseX >= cellStart && mouseX < cellEnd) {
        gridColumn = col;
        break;
      }
      
      // Move to next cell (add cell width + gap)
      accumulated = cellEnd + gridGap;
      
      // If we're in a gap, assign to the next column
      if (mouseX >= cellEnd && mouseX < accumulated && col < GRID_COLUMNS) {
        gridColumn = col + 1;
        break;
      }
    }
    
    // Ensure column is within bounds
    gridColumn = Math.max(1, Math.min(GRID_COLUMNS, gridColumn));
    
    // Calculate row position (simpler with fixed height)
    const rowHeight = MIN_ROW_HEIGHT;
    const rowWithGap = rowHeight + gridGap;
    
    let gridRow = 1;
    if (mouseY >= 0) {
      // Direct calculation for uniform rows
      gridRow = Math.floor(mouseY / rowWithGap) + 1;
      
      // Check if we're in the gap between rows
      const rowPosition = mouseY % rowWithGap;
      if (rowPosition > rowHeight) {
        // We're in a gap, move to next row
        gridRow = Math.ceil(mouseY / rowWithGap) + 1;
      }
    }
    
    // Ensure row is at least 1
    gridRow = Math.max(1, gridRow);
    
    // Only update if position changed
    if (!hoveredCell || hoveredCell.gridColumn !== gridColumn || hoveredCell.gridRow !== gridRow) {
      console.log('Grid position:', {
        mousePos: { x: mouseX, y: mouseY },
        gridCell: { col: gridColumn, row: gridRow },
        cellDimensions: { width: cellWidth, height: rowHeight },
      });
      
      setHoveredCell({ gridColumn, gridRow });
    }
  }, [draggedBlockId, gridGap, hoveredCell]);
  
  // Handle mouse up - simple drop
  const handleMouseUp = useCallback(() => {
    if (draggedBlockId && hoveredCell) {
      const block = blocks[draggedBlockId];
      const columnSpan = block.columnSpan || 3;
      const rowSpan = block.rowSpan || 1;
      
      // Adjust position to keep block within bounds
      const finalColumn = Math.min(hoveredCell.gridColumn, 
        GRID_COLUMNS - columnSpan + 1);
      const finalRow = hoveredCell.gridRow;
      
      console.log('Dropping block at:', { 
        hoveredCell, 
        finalColumn, 
        finalRow,
        columnSpan,
        rowSpan 
      });
      
      // Update block with new position
      onUpdateBlock(draggedBlockId, {
        ...block,
        gridColumn: finalColumn,
        gridRow: finalRow,
        columnSpan,
        rowSpan,
      });
    }
    
    // Clean up
    setDraggedBlockId(null);
    setHoveredCell(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [draggedBlockId, hoveredCell, blocks, onUpdateBlock]);
  
  // Handle resize start
  const handleResizeStart = useCallback((e, blockId, handle) => {
    e.preventDefault();
    e.stopPropagation();
    
    const block = blocks[blockId];
    if (!block) return;
    
    setResizingBlock({
      id: blockId,
      handle,
      originalSpans: {
        columnSpan: block.columnSpan || 3,
        rowSpan: block.rowSpan || 1,
      },
      startX: e.clientX,
      startY: e.clientY,
    });
    
    onSelectBlock(blockId);
  }, [blocks, onSelectBlock]);
  
  // Handle resize move
  const handleResizeMove = useCallback((e) => {
    if (!resizingBlock || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const columnWidth = containerRect.width / GRID_COLUMNS;
    const rowHeight = MIN_ROW_HEIGHT + gridGap;
    
    const deltaX = e.clientX - resizingBlock.startX;
    const deltaY = e.clientY - resizingBlock.startY;
    
    const columnDelta = Math.round(deltaX / columnWidth);
    const rowDelta = Math.round(deltaY / rowHeight);
    
    let newColumnSpan = resizingBlock.originalSpans.columnSpan;
    let newRowSpan = resizingBlock.originalSpans.rowSpan;
    
    const block = blocks[resizingBlock.id];
    const gridColumn = block.gridColumn || 1;
    const gridRow = block.gridRow || 1;
    
    switch (resizingBlock.handle) {
      case 'right':
        newColumnSpan = Math.max(MIN_COLUMN_SPAN, 
          Math.min(GRID_COLUMNS - gridColumn + 1, 
            resizingBlock.originalSpans.columnSpan + columnDelta));
        break;
      case 'bottom':
        newRowSpan = Math.max(MIN_ROW_SPAN, 
          resizingBlock.originalSpans.rowSpan + rowDelta);
        break;
      case 'bottom-right':
        newColumnSpan = Math.max(MIN_COLUMN_SPAN, 
          Math.min(GRID_COLUMNS - gridColumn + 1, 
            resizingBlock.originalSpans.columnSpan + columnDelta));
        newRowSpan = Math.max(MIN_ROW_SPAN, 
          resizingBlock.originalSpans.rowSpan + rowDelta);
        break;
    }
    
    setResizePreview({
      columnSpan: newColumnSpan,
      rowSpan: newRowSpan,
    });
  }, [resizingBlock, blocks, gridGap]);
  
  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (resizingBlock && resizePreview) {
      const block = blocks[resizingBlock.id];
      onUpdateBlock(resizingBlock.id, {
        ...block,
        columnSpan: resizePreview.columnSpan,
        rowSpan: resizePreview.rowSpan,
      });
    }
    
    setResizingBlock(null);
    setResizePreview(null);
  }, [resizingBlock, resizePreview, blocks, onUpdateBlock]);
  
  // Set up drag event listeners
  useEffect(() => {
    if (draggedBlockId) {
      const handleMove = (e) => handleMouseMove(e);
      const handleUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
    }
  }, [draggedBlockId, handleMouseMove, handleMouseUp]);
  
  // Set up resize event listeners
  useEffect(() => {
    if (resizingBlock) {
      const handleMove = (e) => handleResizeMove(e);
      const handleUp = () => handleResizeEnd();
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.body.style.cursor = 'nwse-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [resizingBlock, handleResizeMove, handleResizeEnd]);
  
  // Handle block selection
  const handleBlockClick = useCallback((e, blockId) => {
    e.stopPropagation();
    onSelectBlock(blockId);
  }, [onSelectBlock]);
  
  // Render grid cells for visual reference
  const renderGridCells = () => {
    const cells = [];
    // Render extra rows for drag and drop
    const visibleRows = Math.max(maxRows + 5, 10);
    for (let row = 1; row <= visibleRows; row++) {
      for (let col = 1; col <= GRID_COLUMNS; col++) {
        const isHovered = hoveredCell && 
          hoveredCell.gridColumn === col && 
          hoveredCell.gridRow === row;
        const isDragTarget = draggedBlockId && isHovered;
        
        cells.push(
          <div
            key={`${row}-${col}`}
            className={cx('grid-cell', { 
              'drag-over': isHovered,
              'drag-target': isDragTarget 
            })}
            style={{
              gridColumn: col,
              gridRow: row,
            }}
            data-grid-column={col}
            data-grid-row={row}
          >
            {/* Show column number in first row */}
            {row === 1 && (
              <span className="grid-cell-label">{col}</span>
            )}
            {/* Show coordinates when dragging for debugging */}
            {isDragTarget && (
              <span className="grid-cell-debug" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '10px',
                color: 'rgba(0, 123, 193, 0.8)',
                fontWeight: 'bold',
              }}>
                {col},{row}
              </span>
            )}
          </div>
        );
      }
    }
    return cells;
  };
  
  return (
    <div 
      ref={containerRef}
      className={cx('grid-12-layout', className, {
        'show-overlay': showGridOverlay,
        'is-dragging': !!draggedBlockId,
        'is-resizing': !!resizingBlock,
      })}
      style={{
        '--grid-gap': `${gridGap}px`,
        '--grid-rows': Math.max(maxRows + 5, 10),
      }}
      onClick={() => onSelectBlock(null)}
    >
      {/* Grid header indicator */}
      <div className="grid-header">
        <span className="grid-indicator">12-Column Grid</span>
        <span className="grid-info">Drag blocks to reposition • Resize from corners</span>
      </div>
      
      {/* Grid overlay for visual reference */}
      {showGridOverlay && (
        <div className="grid-overlay">
          {renderGridCells()}
        </div>
      )}
      
      {/* Render blocks and preview in same grid context */}
      
      {/* Drop preview - rendered as grid child like blocks */}
      {draggedBlockId && hoveredCell && (
        <div
          className="grid-block-wrapper drop-preview"
          style={{
            gridColumn: `${hoveredCell.gridColumn} / span ${blocks[draggedBlockId]?.columnSpan || 3}`,
            gridRow: `${hoveredCell.gridRow} / span ${blocks[draggedBlockId]?.rowSpan || 1}`,
          }}
        />
      )}
      
      {blocksLayout.items.map((blockId) => {
        const block = blocks[blockId];
        if (!block) return null;
        
        const gridProps = getBlockGridProps(blockId);
        if (!gridProps) return null;
        
        const isSelected = selectedBlock === blockId;
        const isDragging = draggedBlockId === blockId;
        const isResizing = resizingBlock?.id === blockId;
        
        // Apply resize preview if resizing
        const displayProps = isResizing && resizePreview ? {
          ...gridProps,
          columnSpan: resizePreview.columnSpan,
          rowSpan: resizePreview.rowSpan,
        } : gridProps;
        
        return (
          <div
            key={blockId}
            className={cx('grid-block-wrapper', {
              'selected': isSelected,
              'dragging': isDragging,
              'resizing': isResizing,
            })}
            style={{
              gridColumn: `${displayProps.gridColumn} / span ${displayProps.columnSpan}`,
              gridRow: `${displayProps.gridRow} / span ${displayProps.rowSpan}`,
            }}
            onClick={(e) => handleBlockClick(e, blockId)}
            data-block-id={blockId}
          >
            {/* Drag handle */}
            <div 
              className="drag-handle" 
              title="Drag to move"
              onMouseDown={(e) => handleMouseDown(e, blockId)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="2" cy="2" r="1"/>
                <circle cx="6" cy="2" r="1"/>
                <circle cx="10" cy="2" r="1"/>
                <circle cx="2" cy="6" r="1"/>
                <circle cx="6" cy="6" r="1"/>
                <circle cx="10" cy="6" r="1"/>
                <circle cx="2" cy="10" r="1"/>
                <circle cx="6" cy="10" r="1"/>
                <circle cx="10" cy="10" r="1"/>
              </svg>
            </div>
            
            {/* Delete button */}
            {isSelected && onDeleteBlock && (
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(blockId);
                }}
                aria-label="Delete block"
              >
                ×
              </button>
            )}
            
            {/* Resize handles */}
            {isSelected && (
              <>
                <div 
                  className="resize-handle right"
                  onMouseDown={(e) => handleResizeStart(e, blockId, 'right')}
                />
                <div 
                  className="resize-handle bottom"
                  onMouseDown={(e) => handleResizeStart(e, blockId, 'bottom')}
                />
                <div 
                  className="resize-handle bottom-right"
                  onMouseDown={(e) => handleResizeStart(e, blockId, 'bottom-right')}
                />
              </>
            )}
            
            {/* Size indicator */}
            {isResizing && resizePreview && (
              <div className="size-indicator">
                {resizePreview.columnSpan} × {resizePreview.rowSpan}
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
          <p className="hint">Blocks will snap to the grid automatically</p>
        </div>
      )}
    </div>
  );
};

Grid12Layout.propTypes = {
  blocks: PropTypes.object.isRequired,
  blocksLayout: PropTypes.shape({
    items: PropTypes.array.isRequired,
  }).isRequired,
  onUpdateBlock: PropTypes.func.isRequired,
  selectedBlock: PropTypes.string,
  onSelectBlock: PropTypes.func,
  renderBlock: PropTypes.func.isRequired,
  onDeleteBlock: PropTypes.func,
  showGridOverlay: PropTypes.bool,
  gridGap: PropTypes.number,
  className: PropTypes.string,
};

export default Grid12Layout;