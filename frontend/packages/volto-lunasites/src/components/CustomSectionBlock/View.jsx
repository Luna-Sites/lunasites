import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import config from '@plone/volto/registry';
import './View.scss';
import './FreeformGrid.scss';
import './unified-blocks.scss'; // Force consistent block rendering

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
        
        // For text blocks, estimate height based on content
        const isTextBlock = block['@type'] === 'text' || 
                           block['@type'] === 'slate' || 
                           block['@type'] === 'description';
        
        let blockHeight = block.containerSize?.height || 100;
        
        // For text blocks, use a larger estimated height
        if (isTextBlock) {
          // Get text content from different block types
          let textContent = '';
          
          if (block['@type'] === 'slate' && block.value) {
            // Slate blocks store content in value array
            textContent = block.value.map(node => node.children?.map(child => child.text || '').join('') || '').join(' ');
          } else if (block['@type'] === 'text') {
            // Text blocks might have plaintext or text property
            textContent = block.plaintext || block.text || '';
          } else if (block['@type'] === 'description') {
            // Description blocks store in description field
            textContent = block.description || '';
          }
          
          // Estimate height based on text length and container width
          const containerWidth = block.containerSize?.width || 200;
          const charsPerLine = Math.floor(containerWidth / 8); // Approximate 8px per character
          const estimatedLines = Math.max(1, Math.ceil(textContent.length / charsPerLine));
          const lineHeight = 24; // Standard line height
          const padding = 20; // Some padding for text blocks
          const estimatedHeight = estimatedLines * lineHeight + padding;
          
          blockHeight = Math.max(blockHeight || 50, estimatedHeight);
        }
        
        const blockBottom = blockTop + blockHeight;
        
        if (blockBottom > maxBottom) {
          maxBottom = blockBottom;
        }
      }
    });
    
    // Add modest padding bottom
    return maxBottom + 50;
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
          height: `${containerHeight}px`,
        }}>
          {blocks_layout.items.map((blockId) => {
            const childBlock = blocks[blockId];
            if (!childBlock) return null;
            
            const position = childBlock.position || { x: 0, y: 0 };
            const containerSize = childBlock.containerSize;
            const isTextBlock = childBlock['@type'] === 'text' || 
                               childBlock['@type'] === 'slate' || 
                               childBlock['@type'] === 'description';
            
            return (
              <div 
                key={blockId} 
                className={cx('freeform-item', {
                  'text-block': isTextBlock
                })}
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  // Apply explicit size if available
                  ...(containerSize && {
                    width: `${containerSize.width}px`,
                    // For text blocks, don't apply fixed height in view mode
                    ...(isTextBlock ? {} : { height: `${containerSize.height}px` }),
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