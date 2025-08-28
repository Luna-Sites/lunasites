import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import cx from 'classnames';
import FreeformGrid from './FreeformGrid';
import Grid12Layout from './Grid12Layout';
import FloatingAddButton from '../FloatingAddButton';
import { initializeBlockSizing } from './utils/contentPropertyCalculator';
import { migrateSectionToGrid } from './utils/gridMigration';
import './Edit.scss';
import './unified-blocks.scss'; // Force consistent block rendering

/**
 * Simplified CustomSectionBlock Edit Component
 * 
 * Cleaner implementation that properly integrates with Volto blocks
 * without excessive wrapper containers.
 */
const CustomSectionBlockEdit = ({
  data,
  block,
  onChangeBlock,
  pathname,
  selected,
  manage,
  blocksConfig,
  properties,
}) => {
  const { 
    title = '', 
    blocks = {}, 
    blocks_layout = { items: [] },
    layout_mode = 'grid', // Default to grid
    show_grid_overlay = true,
    grid_gap = 16,
  } = data;
  const [selectedChildBlock, setSelectedChildBlock] = useState(null);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);

  // Handle title change
  const handleTitleChange = useCallback((e) => {
    onChangeBlock(block, {
      ...data,
      title: e.target.value,
    });
  }, [data, block, onChangeBlock]);

  // Toggle between layout modes
  const handleLayoutModeChange = useCallback((newMode) => {
    // If switching from freeform to grid, offer migration
    if (data.layout_mode === 'freeform' && newMode === 'grid' && blocks_layout.items.length > 0) {
      setShowMigrationPrompt(true);
      return;
    }
    
    onChangeBlock(block, {
      ...data,
      layout_mode: newMode,
    });
  }, [data, block, onChangeBlock, blocks_layout.items.length]);
  
  // Handle migration from freeform to grid
  const handleMigration = useCallback((confirm) => {
    setShowMigrationPrompt(false);
    
    if (confirm) {
      const containerWidth = 1200; // Default container width
      const migratedBlocks = migrateSectionToGrid(blocks, blocks_layout.items, containerWidth);
      
      onChangeBlock(block, {
        ...data,
        blocks: migratedBlocks,
        layout_mode: 'grid',
      });
    }
  }, [blocks, blocks_layout.items, data, block, onChangeBlock]);

  // Add new block with proper initialization
  const handleAddBlock = useCallback((blockData) => {
    const blockId = uuid();
    
    let enhancedBlockData = { ...blockData };
    
    // Initialize based on layout mode
    if (layout_mode === 'grid') {
      // For grid mode, find next available position
      let nextRow = 1;
      let nextColumn = 1;
      
      // Find the next available grid position
      blocks_layout.items.forEach(id => {
        const existingBlock = blocks[id];
        if (existingBlock && existingBlock.gridRow) {
          const blockEndRow = existingBlock.gridRow + (existingBlock.rowSpan || 1);
          if (blockEndRow > nextRow) {
            nextRow = blockEndRow;
          }
        }
      });
      
      // If we have existing blocks, place new one in the next row
      if (blocks_layout.items.length > 0) {
        nextColumn = 1; // Start at first column of new row
      }
      
      // Check if this is a text block to give it a better default height
      const isTextBlock = blockData['@type'] === 'text' || 
                         blockData['@type'] === 'slate' || 
                         blockData['@type'] === 'description';
      
      enhancedBlockData = {
        ...blockData,
        gridColumn: blockData.gridColumn || nextColumn,
        gridRow: blockData.gridRow || nextRow,
        columnSpan: blockData.columnSpan || 4,
        rowSpan: blockData.rowSpan || (isTextBlock ? 2 : 1), // Text blocks start with 2 rows
      };
    } else if (layout_mode === 'freeform') {
      // For freeform mode, add position
      enhancedBlockData = {
        ...blockData,
        position: blockData.position || { x: 50, y: 50 },
      };
      
      // Add container size and content properties
      const sizedBlockData = initializeBlockSizing(enhancedBlockData);
      enhancedBlockData = {
        ...sizedBlockData,
        position: enhancedBlockData.position,
      };
    }
    
    const newBlocks = {
      ...blocks,
      [blockId]: enhancedBlockData,
    };
    
    const newBlocksLayout = {
      ...blocks_layout,
      items: [...blocks_layout.items, blockId],
    };
    
    onChangeBlock(block, {
      ...data,
      blocks: newBlocks,
      blocks_layout: newBlocksLayout,
    });
  }, [blocks, blocks_layout, data, block, onChangeBlock]);

  // Handle child block changes
  const handleChildBlockChange = useCallback((blockId, blockData) => {
    onChangeBlock(block, {
      ...data,
      blocks: {
        ...blocks,
        [blockId]: blockData,
      },
    });
  }, [blocks, data, block, onChangeBlock]);

  // Handle block position update (for freeform mode)
  const handleUpdateBlockPosition = useCallback((blockId, position) => {
    onChangeBlock(block, {
      ...data,
      blocks: {
        ...blocks,
        [blockId]: {
          ...blocks[blockId],
          position,
        },
      },
    });
  }, [blocks, data, block, onChangeBlock]);

  // Handle unified block size and content update
  const handleUpdateBlockSize = useCallback((blockId, updatedBlockData) => {
    onChangeBlock(block, {
      ...data,
      blocks: {
        ...blocks,
        [blockId]: {
          ...blocks[blockId],
          ...updatedBlockData, // Contains containerSize + content properties
        },
      },
    });
  }, [blocks, data, block, onChangeBlock]);
  
  // Handle block update (for Grid12Layout)
  const handleUpdateBlock = useCallback((blockId, updatedBlockData) => {
    onChangeBlock(block, {
      ...data,
      blocks: {
        ...blocks,
        [blockId]: updatedBlockData,
      },
    });
  }, [blocks, data, block, onChangeBlock]);

  // Delete block
  const handleDeleteBlock = useCallback((blockId) => {
    const newBlocks = { ...blocks };
    delete newBlocks[blockId];
    
    const newItems = blocks_layout.items.filter(id => id !== blockId);
    
    onChangeBlock(block, {
      ...data,
      blocks: newBlocks,
      blocks_layout: {
        ...blocks_layout,
        items: newItems,
      },
    });
  }, [blocks, blocks_layout, data, block, onChangeBlock]);

  // Render a single block
  const renderBlock = useCallback((blockId) => {
    const childBlock = blocks[blockId];
    if (!childBlock) return null;

    const BlockComponent = blocksConfig?.[childBlock['@type']]?.edit;
    if (!BlockComponent) {
      return <div>Unknown block type: {childBlock['@type']}</div>;
    }
    
    // Apply dynamic styles based on calculated properties
    const blockType = childBlock['@type'];
    const isButtonBlock = blockType === '__button' || blockType === 'button';
    const isTextBlock = blockType === 'text' || blockType === 'slate';
    
    const dynamicStyles = {};
    
    // Button block styles
    if (isButtonBlock) {
      if (childBlock.fontSize) {
        dynamicStyles['--button-font-size'] = `${childBlock.fontSize}px`;
      }
      if (childBlock.padding) {
        dynamicStyles['--button-padding'] = `${childBlock.padding}px`;
      }
      if (childBlock.buttonWidth) {
        dynamicStyles['--button-width'] = `${childBlock.buttonWidth}px`;
      }
    }
    
    // Text block styles
    // Text blocks no longer use dynamic font sizing
    // Font size is controlled by the user through text editing tools
    if (isTextBlock) {
      // Line height can still be set if needed for specific styling
      if (childBlock.lineHeight) {
        dynamicStyles['--text-line-height'] = childBlock.lineHeight;
      }
    }

    // Handle Description block specially - it expects onChangeField
    if (childBlock['@type'] === 'description') {
      return (
        <BlockComponent
          data={childBlock}
          properties={properties}
          block={blockId}
          pathname={pathname || properties?.['@id'] || ''}
          manage={manage}
          onChangeBlock={handleChildBlockChange}
          onSelectBlock={setSelectedChildBlock}
          onChangeField={(field, value) => {
            // Update the description block's data
            handleChildBlockChange(blockId, {
              ...childBlock,
              [field]: value,
            });
          }}
          selected={selectedChildBlock === blockId}
          blocksConfig={blocksConfig}
        />
      );
    }

    // Wrap button blocks with dynamic styling ONLY in grid layout
    if (isButtonBlock && layout_mode === 'grid') {
      return (
        <div style={{...dynamicStyles, width: '100%', height: '100%'}} className="custom-section-button-wrapper">
          <style>{`
            .custom-section-button-wrapper {
              width: 100% !important;
              height: 100% !important;
              display: block !important;
            }
            .custom-section-button-wrapper .ui.button {
              font-size: var(--button-font-size, 16px) !important;
              padding: var(--button-padding, 12px) calc(var(--button-padding, 12px) * 1.5) !important;
              width: 100% !important;
              height: 100% !important;
              min-height: unset !important;
              max-width: 100% !important;
              max-height: 100% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .custom-section-button-wrapper .block.__button {
              width: 100% !important;
              height: 100% !important;
            }
            .custom-section-button-wrapper .align {
              width: 100% !important;
              height: 100% !important;
            }
          `}</style>
          <BlockComponent
            data={childBlock}
            properties={properties}
            block={blockId}
            pathname={pathname || properties?.['@id'] || ''}
            manage={manage}
            onChangeBlock={handleChildBlockChange}
            onSelectBlock={setSelectedChildBlock}
            selected={selectedChildBlock === blockId}
            blocksConfig={blocksConfig}
          />
        </div>
      );
    }
    
    // For button blocks in non-grid mode, render normally
    if (isButtonBlock && layout_mode !== 'grid') {
      return (
        <BlockComponent
          data={childBlock}
          properties={properties}
          block={blockId}
          pathname={pathname || properties?.['@id'] || ''}
          manage={manage}
          onChangeBlock={handleChildBlockChange}
          onSelectBlock={setSelectedChildBlock}
          selected={selectedChildBlock === blockId}
          blocksConfig={blocksConfig}
        />
      );
    }
    
    // Wrap text blocks with container ONLY in grid layout
    if (isTextBlock && layout_mode === 'grid') {
      return (
        <div style={dynamicStyles} className="custom-section-text-wrapper">
          <style>{`
            .custom-section-text-wrapper {
              width: 100%;
              min-height: 100%;
              /* Remove fixed height and overflow to allow content to grow */
              /* Text should determine its own height based on content */
            }
            .custom-section-text-wrapper p,
            .custom-section-text-wrapper div[role="textbox"] {
              /* Font size is now controlled by the text editor, not resize */
              line-height: var(--text-line-height, 1.5) !important;
            }
          `}</style>
          <BlockComponent
            data={childBlock}
            properties={properties}
            block={blockId}
            pathname={pathname || properties?.['@id'] || ''}
            manage={manage}
            onChangeBlock={handleChildBlockChange}
            onSelectBlock={setSelectedChildBlock}
            selected={selectedChildBlock === blockId}
            blocksConfig={blocksConfig}
          />
        </div>
      );
    }
    
    // Return other blocks directly without wrapper
    return (
      <BlockComponent
        data={childBlock}
        properties={properties}
        block={blockId}
        pathname={pathname || properties?.['@id'] || ''}
        manage={manage}
        onChangeBlock={handleChildBlockChange}
        onSelectBlock={setSelectedChildBlock}
        selected={selectedChildBlock === blockId}
        blocksConfig={blocksConfig}
      />
    );
  }, [
    blocks,
    blocksConfig,
    properties,
    pathname,
    manage,
    handleChildBlockChange,
    selectedChildBlock,
    setSelectedChildBlock,
  ]);

  const isEmpty = blocks_layout.items.length === 0;

  return (
    <div className={cx('custom-section-block-edit', { selected })}>
      {/* Title Input */}
      <div className="section-header">
        <input
          type="text"
          placeholder="Section title (optional)"
          value={title}
          onChange={handleTitleChange}
          className="section-title-input"
        />
        
        {/* Layout Mode Selector */}
        <div className="layout-mode-selector">
          <button
            className={cx('layout-mode-btn', { active: layout_mode === 'linear' })}
            onClick={() => handleLayoutModeChange('linear')}
            title="Linear layout - vertical stack"
          >
            ☰
          </button>
          <button
            className={cx('layout-mode-btn', { active: layout_mode === 'grid' })}
            onClick={() => handleLayoutModeChange('grid')}
            title="Grid layout - 12 columns"
          >
            ⊞
          </button>
          <button
            className={cx('layout-mode-btn', { active: layout_mode === 'freeform' })}
            onClick={() => handleLayoutModeChange('freeform')}
            title="Freeform layout - free positioning"
          >
            ⚡
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isEmpty ? (
        <div className="empty-section">
          <FloatingAddButton
            onAddBlock={handleAddBlock}
            blockId={block}
            blocksConfig={blocksConfig}
            properties={properties}
          />
          <p className="empty-message">Add your first block to get started</p>
        </div>
      ) : layout_mode === 'grid' ? (
        // Grid Layout - 12-column responsive grid
        <div className="grid-layout-container">
          <Grid12Layout
            blocks={blocks}
            blocksLayout={blocks_layout}
            onUpdateBlock={handleUpdateBlock}
            selectedBlock={selectedChildBlock}
            onSelectBlock={setSelectedChildBlock}
            renderBlock={renderBlock}
            onDeleteBlock={handleDeleteBlock}
            showGridOverlay={show_grid_overlay}
            gridGap={grid_gap}
          />
          
          <FloatingAddButton
            onAddBlock={handleAddBlock}
            blockId={block}
            blocksConfig={blocksConfig}
            properties={properties}
            className="grid-add-button"
          />
        </div>
      ) : layout_mode === 'freeform' ? (
        // Freeform Layout - Squarespace-style free positioning
        <div className="freeform-layout-container">
          <FreeformGrid
            blocks={blocks}
            blocksLayout={blocks_layout}
            onUpdateBlockPosition={handleUpdateBlockPosition}
            onUpdateBlockSize={handleUpdateBlockSize}
            selectedBlock={selectedChildBlock}
            onSelectBlock={setSelectedChildBlock}
            renderBlock={renderBlock}
            onDeleteBlock={handleDeleteBlock}
          />
          
          <FloatingAddButton
            onAddBlock={handleAddBlock}
            blockId={block}
            blocksConfig={blocksConfig}
            properties={properties}
            className="freeform-add-button"
          />
        </div>
      ) : (
        // Linear Layout - Simple vertical stack
        <div className="linear-layout">
          {blocks_layout.items.map((blockId) => (
            <div
              key={blockId}
              className={cx('linear-block', {
                selected: selectedChildBlock === blockId,
              })}
              onClick={() => setSelectedChildBlock(blockId)}
            >
              {renderBlock(blockId)}
            </div>
          ))}
          
          <FloatingAddButton
            onAddBlock={handleAddBlock}
            blockId={block}
            blocksConfig={blocksConfig}
            properties={properties}
          />
        </div>
      )}
      
      {/* Migration Prompt */}
      {showMigrationPrompt && (
        <div className="migration-prompt">
          <div className="migration-dialog">
            <h3>Migrate to Grid Layout?</h3>
            <p>Converting from freeform to grid layout will automatically arrange your blocks in a 12-column grid.</p>
            <p>Block positions will be preserved as closely as possible.</p>
            <div className="migration-actions">
              <button onClick={() => handleMigration(true)} className="primary">
                Migrate to Grid
              </button>
              <button onClick={() => handleMigration(false)} className="secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CustomSectionBlockEdit.propTypes = {
  data: PropTypes.object.isRequired,
  block: PropTypes.string.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  pathname: PropTypes.string,
  selected: PropTypes.bool,
  manage: PropTypes.bool,
  blocksConfig: PropTypes.object,
  properties: PropTypes.object,
};

export default CustomSectionBlockEdit;