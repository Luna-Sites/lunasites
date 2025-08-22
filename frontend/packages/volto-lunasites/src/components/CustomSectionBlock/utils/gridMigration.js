/**
 * Grid Migration Utilities
 * 
 * Functions to convert between pixel-based positioning and 12-column grid coordinates.
 * Handles migration from FreeformGrid to Grid12Layout while preserving layout intent.
 */

/**
 * Convert pixel X position to grid column (1-12)
 * @param {number} pixelX - X position in pixels
 * @param {number} containerWidth - Container width in pixels
 * @returns {number} Grid column (1-12)
 */
export const pixelToGridColumn = (pixelX, containerWidth) => {
  const columnWidth = containerWidth / 12;
  const column = Math.floor(pixelX / columnWidth) + 1;
  return Math.max(1, Math.min(12, column));
};

/**
 * Convert pixel width to column span
 * @param {number} pixelWidth - Width in pixels
 * @param {number} containerWidth - Container width in pixels
 * @returns {number} Number of columns to span (1-12)
 */
export const pixelWidthToColumnSpan = (pixelWidth, containerWidth) => {
  const columnWidth = containerWidth / 12;
  const span = Math.round(pixelWidth / columnWidth);
  return Math.max(1, Math.min(12, span));
};

/**
 * Convert pixel Y position to grid row
 * @param {number} pixelY - Y position in pixels
 * @param {number} rowHeight - Height of each row in pixels (default 60)
 * @returns {number} Grid row (starting from 1)
 */
export const pixelToGridRow = (pixelY, rowHeight = 60) => {
  const row = Math.floor(pixelY / rowHeight) + 1;
  return Math.max(1, row);
};

/**
 * Convert pixel height to row span
 * @param {number} pixelHeight - Height in pixels
 * @param {number} rowHeight - Height of each row in pixels (default 60)
 * @returns {number} Number of rows to span
 */
export const pixelHeightToRowSpan = (pixelHeight, rowHeight = 60) => {
  const span = Math.ceil(pixelHeight / rowHeight);
  return Math.max(1, span);
};

/**
 * Convert grid coordinates back to pixel position (for preview/estimation)
 * @param {number} gridColumn - Starting column (1-12)
 * @param {number} gridRow - Starting row (1-based)
 * @param {number} containerWidth - Container width in pixels
 * @param {number} rowHeight - Height of each row in pixels
 * @returns {Object} {x, y} position in pixels
 */
export const gridToPixelPosition = (gridColumn, gridRow, containerWidth, rowHeight = 60) => {
  const columnWidth = containerWidth / 12;
  return {
    x: (gridColumn - 1) * columnWidth,
    y: (gridRow - 1) * rowHeight
  };
};

/**
 * Convert grid span to pixel dimensions
 * @param {number} columnSpan - Number of columns
 * @param {number} rowSpan - Number of rows
 * @param {number} containerWidth - Container width in pixels
 * @param {number} rowHeight - Height of each row in pixels
 * @returns {Object} {width, height} in pixels
 */
export const gridSpanToPixelSize = (columnSpan, rowSpan, containerWidth, rowHeight = 60) => {
  const columnWidth = containerWidth / 12;
  return {
    width: columnSpan * columnWidth,
    height: rowSpan * rowHeight
  };
};

/**
 * Detect and resolve overlapping blocks in grid
 * @param {Array} blocks - Array of blocks with grid properties
 * @returns {Array} Blocks with adjusted positions to avoid overlaps
 */
export const resolveGridOverlaps = (blocks) => {
  // Sort blocks by row, then column
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.gridRow !== b.gridRow) return a.gridRow - b.gridRow;
    return a.gridColumn - b.gridColumn;
  });

  // Track occupied cells
  const occupiedCells = new Map();
  
  return sortedBlocks.map(block => {
    const { gridColumn, gridRow, columnSpan = 1, rowSpan = 1 } = block;
    
    // Check for overlaps
    let newRow = gridRow;
    let isOverlapping = true;
    
    while (isOverlapping) {
      isOverlapping = false;
      
      for (let r = newRow; r < newRow + rowSpan; r++) {
        for (let c = gridColumn; c < gridColumn + columnSpan; c++) {
          const cellKey = `${r}-${c}`;
          if (occupiedCells.has(cellKey)) {
            isOverlapping = true;
            newRow = occupiedCells.get(cellKey).endRow + 1;
            break;
          }
        }
        if (isOverlapping) break;
      }
    }
    
    // Mark cells as occupied
    for (let r = newRow; r < newRow + rowSpan; r++) {
      for (let c = gridColumn; c < gridColumn + columnSpan; c++) {
        const cellKey = `${r}-${c}`;
        occupiedCells.set(cellKey, { blockId: block.id, endRow: newRow + rowSpan - 1 });
      }
    }
    
    return {
      ...block,
      gridRow: newRow
    };
  });
};

/**
 * Migrate a single block from pixel to grid coordinates
 * @param {Object} block - Block with position and containerSize
 * @param {number} containerWidth - Container width in pixels
 * @returns {Object} Block with added grid properties
 */
export const migrateBlockToGrid = (block, containerWidth = 1200) => {
  const { position = { x: 0, y: 0 }, containerSize } = block;
  
  // Calculate grid coordinates
  const gridColumn = pixelToGridColumn(position.x, containerWidth);
  const gridRow = pixelToGridRow(position.y);
  
  // Calculate spans if size is defined
  let columnSpan = 3; // Default span
  let rowSpan = 1; // Default span
  
  if (containerSize) {
    columnSpan = pixelWidthToColumnSpan(containerSize.width, containerWidth);
    rowSpan = pixelHeightToRowSpan(containerSize.height);
  }
  
  // Ensure block doesn't exceed grid bounds
  if (gridColumn + columnSpan > 13) {
    columnSpan = 13 - gridColumn;
  }
  
  return {
    ...block,
    // Keep original pixel-based properties for backwards compatibility
    position,
    containerSize,
    // Add new grid properties
    gridColumn,
    gridRow,
    columnSpan: Math.max(1, columnSpan),
    rowSpan: Math.max(1, rowSpan)
  };
};

/**
 * Migrate all blocks in a section from pixel to grid
 * @param {Object} blocks - Object containing all blocks
 * @param {Array} blockIds - Array of block IDs in layout order
 * @param {number} containerWidth - Container width for calculation
 * @returns {Object} Updated blocks with grid properties
 */
export const migrateSectionToGrid = (blocks, blockIds, containerWidth = 1200) => {
  const migratedBlocks = {};
  
  // First pass: convert all blocks
  const blocksArray = blockIds.map(id => ({
    id,
    ...migrateBlockToGrid(blocks[id], containerWidth)
  }));
  
  // Second pass: resolve overlaps
  const resolvedBlocks = resolveGridOverlaps(blocksArray);
  
  // Convert back to object format
  resolvedBlocks.forEach(block => {
    const { id, ...blockData } = block;
    migratedBlocks[id] = blockData;
  });
  
  return migratedBlocks;
};

/**
 * Check if a block has valid grid properties
 * @param {Object} block - Block to check
 * @returns {boolean} True if block has valid grid properties
 */
export const hasGridProperties = (block) => {
  return (
    block &&
    typeof block.gridColumn === 'number' &&
    typeof block.gridRow === 'number' &&
    block.gridColumn >= 1 &&
    block.gridColumn <= 12 &&
    block.gridRow >= 1
  );
};

/**
 * Get responsive column span based on breakpoint
 * @param {number} desktopSpan - Column span for desktop (12 columns)
 * @param {string} breakpoint - Current breakpoint ('desktop', 'tablet', 'mobile')
 * @returns {number} Adjusted column span
 */
export const getResponsiveColumnSpan = (desktopSpan, breakpoint) => {
  switch (breakpoint) {
    case 'tablet':
      // 6 columns on tablet
      return Math.max(1, Math.round(desktopSpan / 2));
    case 'mobile':
      // 1 column on mobile (full width)
      return 1;
    default:
      return desktopSpan;
  }
};

/**
 * Get responsive grid column based on breakpoint
 * @param {number} desktopColumn - Column for desktop (1-12)
 * @param {string} breakpoint - Current breakpoint
 * @returns {number} Adjusted column
 */
export const getResponsiveGridColumn = (desktopColumn, breakpoint) => {
  switch (breakpoint) {
    case 'tablet':
      // Map 12 columns to 6
      return Math.max(1, Math.ceil(desktopColumn / 2));
    case 'mobile':
      // Everything starts at column 1
      return 1;
    default:
      return desktopColumn;
  }
};

/**
 * Calculate optimal row height based on content
 * @param {Object} blocks - All blocks in the section
 * @param {Array} blockIds - Block IDs
 * @returns {number} Suggested row height in pixels
 */
export const calculateOptimalRowHeight = (blocks, blockIds) => {
  const heights = [];
  
  blockIds.forEach(id => {
    const block = blocks[id];
    if (block?.containerSize?.height && block?.rowSpan) {
      const singleRowHeight = block.containerSize.height / block.rowSpan;
      heights.push(singleRowHeight);
    }
  });
  
  if (heights.length === 0) return 60; // Default
  
  // Use median height for better consistency
  heights.sort((a, b) => a - b);
  const median = heights[Math.floor(heights.length / 2)];
  
  // Round to nearest 10px for cleaner values
  return Math.round(median / 10) * 10;
};