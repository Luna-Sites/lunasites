import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import FloatingAddButton from '../FloatingAddButton';
import GridLayout from './GridLayout';
import PositionControls from './PositionControls';

const CustomSectionBlockEdit = (props) => {
  const {
    block,
    onChangeBlock,
    data,
    properties,
    blocksConfig,
    onSelectBlock,
    selected,
    pathname,
    manage,
  } = props;

  const [selectedChildBlock, setSelectedChildBlock] = useState(null);
  const [showPositionControls, setShowPositionControls] = useState(false);

  const {
    blocks = {},
    blocks_layout = { 
      items: [],
      mode: 'linear', // 'linear' or 'grid'
      grid: {
        columns: 12,
        rowHeight: 60,
        positions: {}
      }
    },
    title = '',
  } = data;

  // Grid configuration
  const gridConfig = {
    columns: blocks_layout.grid?.columns || 12,
    rowHeight: blocks_layout.grid?.rowHeight || 60,
    positions: blocks_layout.grid?.positions || {}
  };

  const isGridMode = blocks_layout.mode === 'grid';

  const isEmpty = !blocks_layout.items || blocks_layout.items.length === 0;

  const handleTitleChange = (e) => {
    const newData = {
      ...data,
      title: e.target.value,
    };
    onChangeBlock(block, newData);
  };

  // Grid helper functions
  const findEmptyGridPosition = (width = 4, height = 3) => {
    const positions = gridConfig.positions;
    const columns = gridConfig.columns;
    
    // Simple algorithm: find first available position
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x <= columns - width; x++) {
        if (isPositionAvailable(x, y, width, height, positions)) {
          return { x, y, width, height };
        }
      }
    }
    
    // Fallback: stack at bottom
    const maxY = Math.max(0, ...Object.values(positions).map(pos => pos.y + pos.height));
    return { x: 0, y: maxY, width, height };
  };

  const isPositionAvailable = (x, y, width, height, positions) => {
    for (let checkY = y; checkY < y + height; checkY++) {
      for (let checkX = x; checkX < x + width; checkX++) {
        for (const pos of Object.values(positions)) {
          if (checkX >= pos.x && checkX < pos.x + pos.width &&
              checkY >= pos.y && checkY < pos.y + pos.height) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const updateBlockPosition = (blockId, position) => {
    const newBlocksLayout = {
      ...blocks_layout,
      grid: {
        ...blocks_layout.grid,
        positions: {
          ...gridConfig.positions,
          [blockId]: position
        }
      }
    };
    
    const newData = {
      ...data,
      blocks_layout: newBlocksLayout,
    };
    
    onChangeBlock(block, newData);
  };

  const toggleGridMode = () => {
    const newMode = isGridMode ? 'linear' : 'grid';
    const newBlocksLayout = {
      ...blocks_layout,
      mode: newMode,
    };

    // When switching to grid mode, assign initial positions to existing blocks
    if (newMode === 'grid' && blocks_layout.items.length > 0) {
      const newPositions = {};
      blocks_layout.items.forEach((blockId, index) => {
        const y = Math.floor(index / 2) * 4; // Rows of 2 blocks, 4 units tall each
        const x = (index % 2) * 6; // 2 columns, 6 units wide each
        newPositions[blockId] = { x, y, width: 6, height: 4 };
      });
      
      newBlocksLayout.grid = {
        ...blocks_layout.grid,
        positions: newPositions
      };
    }

    const newData = {
      ...data,
      blocks_layout: newBlocksLayout,
    };
    
    onChangeBlock(block, newData);
  };

  const handleAddBlock = (blockData) => {
    const blockId = uuid();
    const newBlocks = {
      ...blocks,
      [blockId]: blockData,
    };
    
    let newBlocksLayout = {
      ...blocks_layout,
      items: [...blocks_layout.items, blockId],
    };

    // If in grid mode, assign position to new block
    if (isGridMode) {
      const position = findEmptyGridPosition();
      newBlocksLayout = {
        ...newBlocksLayout,
        grid: {
          ...blocks_layout.grid,
          positions: {
            ...gridConfig.positions,
            [blockId]: position
          }
        }
      };
    }

    const newData = {
      ...data,
      blocks: newBlocks,
      blocks_layout: newBlocksLayout,
    };

    onChangeBlock(block, newData);
  };

  return (
    <div className="custom-section-block-edit">
      {/* Title Input */}
      <div className="custom-section-title-input">
        <input
          type="text"
          placeholder="Section title (optional)"
          value={title}
          onChange={handleTitleChange}
          className="section-title-field"
        />
      </div>

      {/* Grid Mode Toggle */}
      <div className="grid-mode-toggle">
        <span className="toggle-label">Layout Mode:</span>
        <span className={`mode-label ${!isGridMode ? 'active' : ''}`}>Linear</span>
        <div
          className={`toggle-switch ${isGridMode ? 'active' : ''}`}
          onClick={toggleGridMode}
        />
        <span className={`mode-label ${isGridMode ? 'active' : ''}`}>Grid</span>
      </div>

      {/* Grid Configuration Panel - only show in grid mode */}
      {isGridMode && (
        <div className="grid-config-panel">
          <div className="config-row">
            <label>Resize Mode:</label>
            <span style={{ fontSize: '11px', color: '#666' }}>
              Content resize enabled - resize block content instead of grid containers
            </span>
          </div>
          <div className="config-row">
            <label>Supported Blocks:</label>
            <span style={{ fontSize: '11px', color: '#666' }}>
              Button blocks support font size, padding, and width resizing
            </span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="custom-section-content">
        {isGridMode ? (
          // Grid Layout Mode with Native Drag & Drop
          isEmpty ? (
            <GridLayout
              gridConfig={gridConfig}
              blocks={blocks}
              blocks_layout={blocks_layout}
              onUpdatePosition={updateBlockPosition}
              selectedBlock={selectedChildBlock}
              onSelectBlock={setSelectedChildBlock}
              isDragEnabled={true}
              className="empty"
            >
              <FloatingAddButton
                onAddBlock={handleAddBlock}
                blockId={block}
                blocksConfig={blocksConfig}
                properties={properties}
                className="custom-section-empty"
              />
            </GridLayout>
          ) : (
            <div style={{ position: 'relative' }}>
              <GridLayout
                gridConfig={gridConfig}
                blocks={blocks}
                blocks_layout={blocks_layout}
                onUpdatePosition={updateBlockPosition}
                selectedBlock={selectedChildBlock}
                onSelectBlock={setSelectedChildBlock}
                isDragEnabled={true}
              >
                {({ blockId, position }) => {
                  const childBlock = blocks[blockId];
                  if (!childBlock) return null;
                  
                  const BlockComponent = blocksConfig?.[childBlock['@type']]?.edit;
                  
                  return BlockComponent ? (
                    <BlockComponent
                      data={childBlock}
                      properties={properties}
                      block={blockId}
                      pathname={pathname || properties?.['@id'] || ''}
                      manage={manage !== false}
                      onChangeBlock={(blockId, blockData) => {
                        const newBlocks = {
                          ...blocks,
                          [blockId]: blockData,
                        };
                        const newData = {
                          ...data,
                          blocks: newBlocks,
                        };
                        onChangeBlock(block, newData);
                      }}
                      selected={selectedChildBlock === blockId}
                      index={blocks_layout.items.indexOf(blockId)}
                      blocksConfig={blocksConfig}
                    />
                  ) : (
                    <div className="unknown-block">
                      Unknown block type: {childBlock['@type']}
                    </div>
                  );
                }}
              </GridLayout>
              
              {/* Grid Info */}
              <div style={{
                position: 'absolute',
                bottom: '60px', // Above the add button
                left: '16px',
                zIndex: 5, // Lower z-index so it doesn't block interactions
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '6px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                maxWidth: '250px',
                pointerEvents: 'none' // Allow clicks to pass through
              }}>
                <div>💡 Click to select • Drag ⋮⋮ to move blocks around
                  <br/>🎨 Drag colored handles to resize block content (font size, padding, width)</div>
              </div>
              
              {/* Add Block Button for Grid Mode */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                zIndex: 10
              }}>
                <FloatingAddButton
                  onAddBlock={handleAddBlock}
                  blockId={block}
                  blocksConfig={blocksConfig}
                  properties={properties}
                  className="grid-add-button"
                  inline={true}
                />
              </div>
            </div>
          )
        ) : (
          // Linear Layout Mode (Original)
          isEmpty ? (
            <FloatingAddButton
              onAddBlock={handleAddBlock}
              blockId={block}
              blocksConfig={blocksConfig}
              properties={properties}
              className="custom-section-empty"
            />
          ) : (
            <div className={`section-blocks linear-layout`}>
              {blocks_layout.items.map((childBlockId) => {
                const childBlock = blocks[childBlockId];
                if (!childBlock) return null;
                
                const BlockComponent = blocksConfig?.[childBlock['@type']]?.edit;
                
                return (
                  <div 
                    key={childBlockId} 
                    className={`section-child-block ${selectedChildBlock === childBlockId ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChildBlock(childBlockId);
                    }}
                    style={{ 
                      cursor: 'pointer',
                      border: selectedChildBlock === childBlockId ? '2px solid #007bc1' : '1px solid transparent',
                      borderRadius: '4px',
                      padding: '0.5rem'
                    }}
                  >
                    {BlockComponent ? (
                      <BlockComponent
                        data={childBlock}
                        properties={properties}
                        block={childBlockId}
                        pathname={pathname || properties?.['@id'] || ''}
                        manage={manage !== false}
                        onChangeBlock={(blockId, blockData) => {
                          const newBlocks = {
                            ...blocks,
                            [blockId]: blockData,
                          };
                          const newData = {
                            ...data,
                            blocks: newBlocks,
                          };
                          onChangeBlock(block, newData);
                        }}
                        selected={selectedChildBlock === childBlockId}
                        index={blocks_layout.items.indexOf(childBlockId)}
                        blocksConfig={blocksConfig}
                      />
                    ) : (
                      <div className="unknown-block">
                        Unknown block type: {childBlock['@type']}
                      </div>
                    )}
                  </div>
                );
              })}
              <FloatingAddButton
                onAddBlock={handleAddBlock}
                blockId={block}
                blocksConfig={blocksConfig}
                properties={properties}
                className="custom-section-add-more"
                inline={true}
              />
            </div>
          )
        )}
      </div>
      
      {/* Position Controls Modal */}
      {showPositionControls && selectedChildBlock && (
        <PositionControls
          blockId={selectedChildBlock}
          position={gridConfig.positions[selectedChildBlock] || { x: 0, y: 0, width: 6, height: 4 }}
          onUpdatePosition={updateBlockPosition}
          gridConfig={gridConfig}
          onClose={() => setShowPositionControls(false)}
        />
      )}
    </div>
  );
};

CustomSectionBlockEdit.propTypes = {
  block: PropTypes.string.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  onSelectBlock: PropTypes.func,
  data: PropTypes.shape({
    blocks: PropTypes.object,
    blocks_layout: PropTypes.shape({
      items: PropTypes.array,
      mode: PropTypes.oneOf(['linear', 'grid']),
      grid: PropTypes.shape({
        columns: PropTypes.number,
        rowHeight: PropTypes.number,
        positions: PropTypes.object,
      }),
    }),
    title: PropTypes.string,
  }),
  selected: PropTypes.bool,
  properties: PropTypes.object,
  blocksConfig: PropTypes.object,
  navRoot: PropTypes.object,
  contentType: PropTypes.string,
  pathname: PropTypes.string,
  manage: PropTypes.bool,
};

CustomSectionBlockEdit.defaultProps = {
  data: {
    blocks: {},
    blocks_layout: { 
      items: [],
      mode: 'linear',
      grid: {
        columns: 12,
        rowHeight: 60,
        positions: {}
      }
    },
    title: '',
  },
  selected: false,
  properties: {},
  blocksConfig: {},
  navRoot: null,
  contentType: null,
};

export default CustomSectionBlockEdit;