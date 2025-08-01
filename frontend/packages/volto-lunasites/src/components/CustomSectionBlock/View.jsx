import React from 'react';
import PropTypes from 'prop-types';
import config from '@plone/volto/registry';
import GridLayout from './GridLayout';

const CustomSectionBlockView = ({ data, properties }) => {
  const { 
    blocks = {}, 
    blocks_layout = { 
      items: [],
      mode: 'linear',
      grid: {
        columns: 12,
        rowHeight: 60,
        positions: {}
      }
    } 
  } = data;

  const gridConfig = {
    columns: blocks_layout.grid?.columns || 12,
    rowHeight: blocks_layout.grid?.rowHeight || 60,
    positions: blocks_layout.grid?.positions || {}
  };

  const isGridMode = blocks_layout.mode === 'grid';

  return (
    <div className="custom-section-block">
      {data.title && <h2 className="custom-section-title">{data.title}</h2>}
      
      {isGridMode ? (
        // Grid Layout Mode
        <GridLayout
          gridConfig={gridConfig}
          blocks={blocks}
          blocks_layout={blocks_layout}
        >
          {({ blockId }) => {
            const childBlock = blocks[blockId];
            if (!childBlock) return null;
            
            const BlockComponent = config.blocks.blocksConfig?.[childBlock['@type']]?.view;
            
            return (
              <div className="section-child-block">
                {BlockComponent ? (
                  <BlockComponent
                    data={childBlock}
                    properties={properties}
                    block={blockId}
                  />
                ) : (
                  <div className="unknown-block">
                    Unknown block type: {childBlock['@type']}
                  </div>
                )}
              </div>
            );
          }}
        </GridLayout>
      ) : (
        // Linear Layout Mode (Original)
        <div className="section-blocks linear-layout">
          {blocks_layout.items.map((childBlockId) => {
            const childBlock = blocks[childBlockId];
            if (!childBlock) return null;
            
            const BlockComponent = config.blocks.blocksConfig?.[childBlock['@type']]?.view;
            
            return (
              <div key={childBlockId} className="section-child-block">
                {BlockComponent ? (
                  <BlockComponent
                    data={childBlock}
                    properties={properties}
                    block={childBlockId}
                  />
                ) : (
                  <div className="unknown-block">
                    Unknown block type: {childBlock['@type']}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

CustomSectionBlockView.propTypes = {
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
  properties: PropTypes.object,
};

CustomSectionBlockView.defaultProps = {
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
  },
  properties: {},
};

export default CustomSectionBlockView;