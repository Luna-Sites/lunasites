import { useCallback } from 'react';
import PropTypes from 'prop-types';
import config from '@plone/volto/registry';
import './CustomSectionBlock.scss';
const CustomSectionBlockView = ({ data, properties }) => {
  const {
    blocks = {},
    blocks_layout = {
      items: [],
      mode: 'linear',
      grid: {
        columns: 12,
        rowHeight: 60,
        positions: {},
      },
    },
  } = data;

  const gridConfig = {
    columns: blocks_layout.grid?.columns || 12,
    rowHeight: blocks_layout.grid?.rowHeight || 60,
    positions: blocks_layout.grid?.positions || {},
  };

  const isGridMode = blocks_layout.mode === 'grid';

  const renderBlock = useCallback(
    (blockId) => {
      const childBlock = blocks[blockId];
      if (!childBlock) return null;

      const BlockComponent =
        config.blocks.blocksConfig?.[childBlock['@type']]?.view;

      return BlockComponent ? (
        <BlockComponent
          data={childBlock}
          properties={properties}
          block={blockId}
        />
      ) : (
        <div className="unknown-block">
          Unknown block type: {childBlock['@type']}
        </div>
      );
    },
    [blocks, properties],
  );

  const renderGridView = () => {
    const { columns, rowHeight } = gridConfig;
    const totalRows = Math.max(
      1,
      ...Object.values(gridConfig.positions).map((pos) => pos.y + pos.height),
    );

    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${totalRows}, ${rowHeight}px)`,
      gap: '8px',
    };

    return (
      <div className="section-blocks grid-layout-view" style={gridStyle}>
        {blocks_layout.items.map((blockId) => {
          const position = gridConfig.positions[blockId];
          if (!position) return null;

          return (
            <div
              key={blockId}
              className="section-child-block"
              style={{
                gridColumn: `${position.x + 1} / span ${position.width}`,
                gridRow: `${position.y + 1} / span ${position.height}`,
              }}
            >
              {renderBlock(blockId)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="custom-section-block">
      {data.title && <h2 className="custom-section-title">{data.title}</h2>}

      {isGridMode ? (
        renderGridView()
      ) : (
        <div className="section-blocks linear-layout">
          {blocks_layout.items.map((blockId) => (
            <div key={blockId} className="section-child-block">
              {renderBlock(blockId)}
            </div>
          ))}
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
        positions: {},
      },
    },
  },
  properties: {},
};

export default CustomSectionBlockView;
