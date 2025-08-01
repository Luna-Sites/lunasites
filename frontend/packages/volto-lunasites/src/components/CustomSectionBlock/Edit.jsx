import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import FloatingAddButton from '../FloatingAddButton';

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

  const {
    blocks = {},
    blocks_layout = { items: [] },
    title = '',
  } = data;

  const isEmpty = !blocks_layout.items || blocks_layout.items.length === 0;

  const handleTitleChange = (e) => {
    const newData = {
      ...data,
      title: e.target.value,
    };
    onChangeBlock(block, newData);
  };

  const handleAddBlock = (blockData) => {
    const blockId = uuid();
    const newBlocks = {
      ...blocks,
      [blockId]: blockData,
    };
    const newBlocksLayout = {
      items: [...blocks_layout.items, blockId],
    };

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

      {/* Content Area */}
      <div className="custom-section-content">
        {isEmpty ? (
          <FloatingAddButton
            onAddBlock={handleAddBlock}
            blockId={block}
            blocksConfig={blocksConfig}
            properties={properties}
            className="custom-section-empty"
          />
        ) : (
          <div className="section-blocks">
            {blocks_layout.items.map((childBlockId) => {
              const childBlock = blocks[childBlockId];
              if (!childBlock) return null;
              
              // Use edit component in edit mode
              const BlockComponent = blocksConfig?.[childBlock['@type']]?.edit;
              
              return (
                <div 
                  key={childBlockId} 
                  className={`section-child-block ${selectedChildBlock === childBlockId ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChildBlock(childBlockId);
                    console.log('Block clicked:', childBlockId, childBlock);
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
                        console.log('Block data changed:', blockId, blockData);
                        // Update the block within our section
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
    blocks_layout: PropTypes.object,
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
    blocks_layout: { items: [] },
    title: '',
  },
  selected: false,
  properties: {},
  blocksConfig: {},
  navRoot: null,
  contentType: null,
};

export default CustomSectionBlockEdit;