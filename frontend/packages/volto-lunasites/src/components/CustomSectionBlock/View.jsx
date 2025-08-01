import React from 'react';
import PropTypes from 'prop-types';
import config from '@plone/volto/registry';

const CustomSectionBlockView = ({ data, properties }) => {
  const { blocks = {}, blocks_layout = { items: [] } } = data;

  return (
    <div className="custom-section-block">
      {data.title && <h2 className="custom-section-title">{data.title}</h2>}
      <div className="section-blocks">
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
    </div>
  );
};

CustomSectionBlockView.propTypes = {
  data: PropTypes.shape({
    blocks: PropTypes.object,
    blocks_layout: PropTypes.object,
    title: PropTypes.string,
  }),
  properties: PropTypes.object,
};

CustomSectionBlockView.defaultProps = {
  data: {
    blocks: {},
    blocks_layout: { items: [] },
  },
  properties: {},
};

export default CustomSectionBlockView;