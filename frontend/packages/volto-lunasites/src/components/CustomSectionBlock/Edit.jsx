import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import { BlocksForm } from '@plone/volto/components';
import { emptyBlocksForm, getBlocksLayoutFieldname } from '@plone/volto/helpers';
import FloatingAddButton from '../FloatingAddButton';
import GridLayout from './GridLayout';

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
  const [multiSelected, setMultiSelected] = useState([]);

  // Convert our data structure to match what BlocksForm expects
  const data_blocks = data?.data?.blocks;
  const childBlocksForm = isEmpty(data_blocks) ? emptyBlocksForm() : data.data;

  // Initialize selectedBlock if needed
  React.useEffect(() => {
    if (
      isEmpty(data_blocks) &&
      childBlocksForm.blocks_layout.items[0] !== selectedChildBlock
    ) {
      setSelectedChildBlock(childBlocksForm.blocks_layout.items[0]);
      onChangeBlock(block, {
        ...data,
        data: childBlocksForm,
      });
    }
  }, [onChangeBlock, childBlocksForm, selectedChildBlock, block, data, data_blocks]);

  const {
    blocks = {},
    blocks_layout = {
      items: [],
      mode: 'linear', // 'linear' or 'grid'
      grid: {
        columns: 12,
        rowHeight: 60,
        positions: {},
      },
    },
    title = '',
  } = data;

  // Grid configuration
  const gridConfig = {
    columns: blocks_layout.grid?.columns || 12,
    rowHeight: blocks_layout.grid?.rowHeight || 60,
    positions: blocks_layout.grid?.positions || {},
  };

  const isGridMode = blocks_layout.mode === 'grid';

  const isEmpty = !blocks_layout.items || blocks_layout.items.length === 0;

  const handleTitleChange = useCallback((e) => {
    const newData = {
      ...data,
      title: e.target.value,
    };
    onChangeBlock(block, newData);
  }, [data, block, onChangeBlock]);

  const onSelectChildBlock = useCallback(
    (id, isMultipleSelection, event, activeBlock) => {
      let newMultiSelected = [];
      let selected = id;

      if (isMultipleSelection) {
        selected = null;
        const blocksLayoutFieldname = getBlocksLayoutFieldname(data?.data);
        const blocks_layout = data?.data[blocksLayoutFieldname].items;
        if (event.shiftKey) {
          const anchor =
            multiSelected.length > 0
              ? blocks_layout.indexOf(multiSelected[0])
              : blocks_layout.indexOf(activeBlock);
          const focus = blocks_layout.indexOf(id);
          if (anchor === focus) {
            newMultiSelected = [id];
          } else if (focus > anchor) {
            newMultiSelected = [...blocks_layout.slice(anchor, focus + 1)];
          } else {
            newMultiSelected = [...blocks_layout.slice(focus, anchor + 1)];
          }
        }
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
          if (multiSelected.includes(id)) {
            selected = null;
            newMultiSelected = multiSelected.filter(x => x !== id);
          } else {
            newMultiSelected = [...(multiSelected || []), id];
          }
        }
      }

      setSelectedChildBlock(selected);
      setMultiSelected(newMultiSelected);
    },
    [data.data, multiSelected],
  );

  const handleChildBlockChange = useCallback((blockId, blockData) => {
    const newBlocks = {
      ...blocks,
      [blockId]: blockData,
    };
    const newData = {
      ...data,
      blocks: newBlocks,
    };
    onChangeBlock(block, newData);
  }, [blocks, data, block, onChangeBlock]);

  const isPositionAvailable = useMemo(() => (x, y, width, height, positions) => {
    for (let checkY = y; checkY < y + height; checkY++) {
      for (let checkX = x; checkX < x + width; checkX++) {
        for (const pos of Object.values(positions)) {
          if (
            checkX >= pos.x &&
            checkX < pos.x + pos.width &&
            checkY >= pos.y &&
            checkY < pos.y + pos.height
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const findEmptyGridPosition = useCallback((width = 4, height = 3) => {
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
    const maxY = Math.max(
      0,
      ...Object.values(positions).map((pos) => pos.y + pos.height),
    );
    return { x: 0, y: maxY, width, height };
  }, [gridConfig, isPositionAvailable]);

  const updateBlockPosition = useCallback((blockId, position) => {
    const newBlocksLayout = {
      ...blocks_layout,
      grid: {
        ...blocks_layout.grid,
        positions: {
          ...gridConfig.positions,
          [blockId]: position,
        },
      },
    };

    const newData = {
      ...data,
      blocks_layout: newBlocksLayout,
    };

    onChangeBlock(block, newData);
  }, [blocks_layout, gridConfig, data, block, onChangeBlock]);

  const toggleGridMode = useCallback(() => {
    const newMode = isGridMode ? 'linear' : 'grid';
    const newBlocksLayout = {
      ...blocks_layout,
      mode: newMode,
    };

    // When switching to grid mode, assign initial positions to existing blocks
    if (newMode === 'grid' && blocks_layout.items.length > 0) {
      const newPositions = {};
      blocks_layout.items.forEach((blockId, index) => {
        const y = Math.floor(index / 2) * 4;
        const x = (index % 2) * 6;
        newPositions[blockId] = { x, y, width: 6, height: 4 };
      });

      newBlocksLayout.grid = {
        ...blocks_layout.grid,
        positions: newPositions,
      };
    }

    const newData = {
      ...data,
      blocks_layout: newBlocksLayout,
    };

    onChangeBlock(block, newData);
  }, [isGridMode, blocks_layout, data, block, onChangeBlock]);

  const handleAddBlock = useCallback((blockData) => {
    const blockId = uuid();
    
    // Create new child blocks form data
    const newChildBlocksForm = {
      ...childBlocksForm,
      blocks: {
        ...childBlocksForm.blocks,
        [blockId]: blockData,
      },
      blocks_layout: {
        ...childBlocksForm.blocks_layout,
        items: [...childBlocksForm.blocks_layout.items, blockId],
      },
    };

    // Update the main data structure
    const newData = {
      ...data,
      data: newChildBlocksForm,
      // Keep the old structure for backward compatibility
      blocks: newChildBlocksForm.blocks,
      blocks_layout: {
        ...blocks_layout,
        items: newChildBlocksForm.blocks_layout.items,
      },
    };

    onChangeBlock(block, newData);
  }, [childBlocksForm, blocks_layout, data, block, onChangeBlock]);

  const renderBlock = useCallback((blockId, index) => {
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
        onChangeBlock={handleChildBlockChange}
        selected={selectedChildBlock === blockId}
        index={index}
        blocksConfig={blocksConfig}
      />
    ) : (
      <div className="unknown-block">
        Unknown block type: {childBlock['@type']}
      </div>
    );
  }, [blocks, blocksConfig, properties, pathname, manage, handleChildBlockChange, selectedChildBlock]);

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
        <span className={`mode-label ${!isGridMode ? 'active' : ''}`}>
          Linear
        </span>
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
            <span className="config-description">
              Content resize enabled - resize block content instead of grid
              containers
            </span>
          </div>
          <div className="config-row">
            <label>Supported Blocks:</label>
            <span className="config-description">
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
                {({ blockId }) => renderBlock(blockId, blocks_layout.items.indexOf(blockId))}
              </GridLayout>

              <div className="grid-info">
                💡 Click to select • Drag ⋮⋮ to move blocks around
                <br />
                🎨 Drag colored handles to resize block content (font size,
                padding, width)
              </div>

              <div className="grid-add-button-container">
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
        ) : // Linear Layout Mode (Original)
        isEmpty ? (
          <FloatingAddButton
            onAddBlock={handleAddBlock}
            blockId={block}
            blocksConfig={blocksConfig}
            properties={properties}
            className="custom-section-empty"
          />
        ) : (
          <div className="section-blocks linear-layout">
            <BlocksForm
              {...props}
              metadata={properties}
              properties={childBlocksForm}
              manage={manage}
              selectedBlock={selected ? selectedChildBlock : null}
              onSelectBlock={(id, l, e) => {
                const isMultipleSelection = e
                  ? e.shiftKey || e.ctrlKey || e.metaKey
                  : false;
                onSelectChildBlock(id, isMultipleSelection, e, selectedChildBlock);
              }}
              onChangeFormData={(newFormData) => {
                onChangeBlock(block, {
                  ...data,
                  data: newFormData,
                });
              }}
              pathname={pathname}
            />
          </div>
        )}
      </div>

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
        positions: {},
      },
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
