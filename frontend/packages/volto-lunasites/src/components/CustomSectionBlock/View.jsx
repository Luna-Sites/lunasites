import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import config from '@plone/volto/registry';
import './View.scss';
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
  
  const isFreeformMode = layout_mode !== 'linear';
  
  // Calculate container height based on block positions
  const containerHeight = useMemo(() => {
    if (!isFreeformMode) return 'auto';
    
    let maxBottom = 400; // Minimum height
    
    blocks_layout.items.forEach(blockId => {
      const block = blocks[blockId];
      if (block?.position) {
        const blockTop = block.position.y || 0;
        const blockHeight = block.containerSize?.height || 100;
        const blockBottom = blockTop + blockHeight;
        
        if (blockBottom > maxBottom) {
          maxBottom = blockBottom;
        }
      }
    });
    
    // Add padding bottom
    return maxBottom + 100;
  }, [blocks, blocks_layout.items, isFreeformMode]);

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
    <section className={cx('custom-section-block-view', { 'freeform': isFreeformMode })}>
      {title && <h2 className="section-title">{title}</h2>}
      
      {isFreeformMode ? (
        // Freeform Layout - Absolute positioned blocks
        <div className="freeform-view" style={{
          position: 'relative',
          minHeight: `${containerHeight}px`,
        }}>
          {blocks_layout.items.map((blockId) => {
            const childBlock = blocks[blockId];
            if (!childBlock) return null;
            
            const position = childBlock.position || { x: 0, y: 0 };
            const containerSize = childBlock.containerSize;
            
            return (
              <div 
                key={blockId} 
                className="freeform-item"
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  // Apply explicit size if available
                  ...(containerSize && {
                    width: `${containerSize.width}px`,
                    height: `${containerSize.height}px`,
                  }),
                }}
              >
                {renderBlock(blockId)}
              </div>
            );
          })}
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