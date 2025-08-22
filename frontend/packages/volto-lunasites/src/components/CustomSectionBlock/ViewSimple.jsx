import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import config from '@plone/volto/registry';
import './ViewSimple.scss';
import './FreeformGrid.scss';

/**
 * Simplified CustomSectionBlock View Component
 * 
 * Renders blocks in either grid or linear layout without excessive wrappers
 */
const CustomSectionBlockView = ({ data, properties }) => {
  const {
    title = '',
    blocks = {},
    blocks_layout = { items: [] },
    layout_mode = 'freeform', // Default to freeform
  } = data;

  // Render a single block
  const renderBlock = useCallback((blockId) => {
    const childBlock = blocks[blockId];
    if (!childBlock) return null;

    const BlockComponent = config.blocks.blocksConfig?.[childBlock['@type']]?.view;
    
    if (!BlockComponent) {
      return null; // Don't show error in view mode
    }

    return (
      <BlockComponent
        data={childBlock}
        properties={properties}
        block={blockId}
      />
    );
  }, [blocks, properties]);

  // Don't render empty sections
  if (blocks_layout.items.length === 0) {
    return null;
  }

  return (
    <section className={cx('custom-section-block-view', `layout-${layout_mode}`)}>
      {title && <h2 className="section-title">{title}</h2>}
      
      {layout_mode === 'freeform' ? (
        // Freeform Layout - Absolute positioned blocks
        <div className="freeform-view">
          {blocks_layout.items.map((blockId) => {
            const childBlock = blocks[blockId];
            if (!childBlock) return null;
            
            const position = childBlock.position || { x: 0, y: 0 };
            
            return (
              <div 
                key={blockId} 
                className="freeform-item"
                style={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: 'fit-content',
                  height: 'fit-content',
                }}
              >
                {renderBlock(blockId)}
              </div>
            );
          })}
        </div>
      ) : layout_mode === 'grid' ? (
        // Grid Layout - Simple CSS Grid
        <div className="grid-view">
          {blocks_layout.items.map((blockId) => (
            <div key={blockId} className="grid-item">
              {renderBlock(blockId)}
            </div>
          ))}
        </div>
      ) : (
        // Linear Layout - Vertical stack
        <div className="linear-view">
          {blocks_layout.items.map((blockId) => (
            <div key={blockId} className="linear-item">
              {renderBlock(blockId)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

CustomSectionBlockView.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    blocks: PropTypes.object,
    blocks_layout: PropTypes.shape({
      items: PropTypes.array,
    }),
    layout_mode: PropTypes.string,
  }).isRequired,
  properties: PropTypes.object,
};

export default CustomSectionBlockView;