import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import cx from 'classnames';
import SimpleGrid from './SimpleGrid';
import FreeformGrid from './FreeformGrid';
import FloatingAddButton from '../FloatingAddButton';
import './SimpleGrid.scss';
import './EditSimple.scss';

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
  const { title = '', blocks = {}, blocks_layout = { items: [] } } = data;
  const [selectedChildBlock, setSelectedChildBlock] = useState(null);
  const [layoutMode, setLayoutMode] = useState(data.layout_mode || 'freeform');

  // Handle title change
  const handleTitleChange = useCallback((e) => {
    onChangeBlock(block, {
      ...data,
      title: e.target.value,
    });
  }, [data, block, onChangeBlock]);

  // Cycle through layout modes: freeform -> grid -> linear
  const cycleLayoutMode = useCallback(() => {
    const modes = ['freeform', 'grid', 'linear'];
    const currentIndex = modes.indexOf(layoutMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    
    setLayoutMode(newMode);
    onChangeBlock(block, {
      ...data,
      layout_mode: newMode,
    });
  }, [layoutMode, data, block, onChangeBlock]);

  // Add new block
  const handleAddBlock = useCallback((blockData) => {
    const blockId = uuid();
    
    // For freeform mode, add default position
    const enhancedBlockData = {
      ...blockData,
      position: blockData.position || { x: 10, y: 10 }, // Default position
    };
    
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

  // Handle block reordering
  const handleReorderBlocks = useCallback((newOrder) => {
    onChangeBlock(block, {
      ...data,
      blocks_layout: {
        ...blocks_layout,
        items: newOrder,
      },
    });
  }, [blocks_layout, data, block, onChangeBlock]);

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

    // Return the block component directly without any wrapper
    // The delete button will be handled by the parent container
    return (
      <BlockComponent
        data={childBlock}
        properties={properties}
        block={blockId}
        pathname={pathname || properties?.['@id'] || ''}
        manage={manage}
        onChangeBlock={handleChildBlockChange}
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
    handleDeleteBlock,
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
        
        {/* Layout Mode Toggle */}
        <button
          className={cx('layout-toggle', `mode-${layoutMode}`)}
          onClick={cycleLayoutMode}
          aria-label="Switch layout mode"
        >
          {layoutMode === 'freeform' ? '⚡ Freeform' : layoutMode === 'grid' ? '⊞ Grid' : '☰ Linear'}
        </button>
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
      ) : layoutMode === 'freeform' ? (
        // Freeform Layout - Squarespace-style free positioning
        <div className="freeform-layout-container">
          <FreeformGrid
            blocks={blocks}
            blocksLayout={blocks_layout}
            onUpdateBlockPosition={handleUpdateBlockPosition}
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
      ) : layoutMode === 'grid' ? (
        // Grid Layout - Using SimpleGrid
        <div className="grid-layout-container">
          <SimpleGrid
            blocks={blocks}
            blocksLayout={blocks_layout}
            onReorderBlocks={handleReorderBlocks}
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
            className="grid-add-button"
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