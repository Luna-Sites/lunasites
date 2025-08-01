import React from 'react';
import PropTypes from 'prop-types';
import DraggableBlock from './DraggableBlock';
import GridDropZone from './GridDropZone';

const GridLayout = ({ 
  children, 
  gridConfig, 
  blocks, 
  blocks_layout, 
  onUpdatePosition,
  selectedBlock,
  onSelectBlock,
  isDragEnabled = true,
  className = ''
}) => {
  const { columns, rowHeight, positions } = gridConfig;
  
  // Calculate the total height needed for the grid
  const maxY = Math.max(0, ...Object.values(positions).map(pos => pos.y + pos.height));
  const totalRows = Math.max(8, maxY); // Minimum 8 rows for empty sections
  
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${totalRows}, ${rowHeight}px)`,
    gap: '8px',
    minHeight: `${totalRows * rowHeight + (totalRows - 1) * 8}px`,
    position: 'relative',
    backgroundColor: 'rgba(248, 249, 250, 0.3)',
    border: '1px dashed rgba(0, 123, 193, 0.3)',
    borderRadius: '8px',
    padding: '16px',
  };

  const renderGridItem = (blockId) => {
    const position = positions[blockId];
    if (!position) return null;

    const itemStyle = {
      gridColumn: `${position.x + 1} / span ${position.width}`,
      gridRow: `${position.y + 1} / span ${position.height}`,
      minHeight: `${position.height * rowHeight + (position.height - 1) * 8}px`,
      border: '1px solid rgba(0, 123, 193, 0.2)',
      borderRadius: '6px',
      backgroundColor: 'white',
      padding: '8px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
    };

    const content = children({ blockId, position });

    return (
      <div
        key={blockId}
        className="grid-item"
        style={itemStyle}
        data-block-id={blockId}
      >
        {isDragEnabled ? (
          <DraggableBlock
            blockId={blockId}
            position={position}
            onUpdatePosition={onUpdatePosition}
            selected={selectedBlock === blockId}
            onSelect={onSelectBlock}
            gridConfig={gridConfig}
          >
            {content}
          </DraggableBlock>
        ) : (
          <div 
            className={`non-draggable-block ${selectedBlock === blockId ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectBlock) onSelectBlock(blockId);
            }}
            style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            {content}
          </div>
        )}
      </div>
    );
  };

  const renderGridGuides = () => {
    const guides = [];
    
    // Vertical guides
    for (let i = 1; i < columns; i++) {
      guides.push(
        <div
          key={`v-guide-${i}`}
          className="grid-guide vertical"
          style={{
            position: 'absolute',
            left: `calc(${(i / columns) * 100}% - 1px)`,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'rgba(0, 123, 193, 0.1)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      );
    }
    
    // Horizontal guides (every 2 rows for cleaner look)
    for (let i = 2; i < totalRows; i += 2) {
      guides.push(
        <div
          key={`h-guide-${i}`}
          className="grid-guide horizontal"
          style={{
            position: 'absolute',
            top: `calc(${(i / totalRows) * 100}% - 1px)`,
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'rgba(0, 123, 193, 0.1)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      );
    }
    
    return guides;
  };

  const gridContent = (
    <div className={`grid-layout ${className}`} style={gridStyle}>
      {renderGridGuides()}
      
      {/* Render positioned blocks */}
      {blocks_layout.items.map(renderGridItem)}
      
      {/* Render children for any additional content (like FloatingAddButton) */}
      {typeof children === 'function' ? null : children}
    </div>
  );

  return isDragEnabled ? (
    <GridDropZone 
      gridConfig={gridConfig}
      onDropBlock={onUpdatePosition}
      className={className}
    >
      {gridContent}
    </GridDropZone>
  ) : (
    gridContent
  );
};

GridLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  gridConfig: PropTypes.shape({
    columns: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
    positions: PropTypes.object.isRequired,
  }).isRequired,
  blocks: PropTypes.object.isRequired,
  blocks_layout: PropTypes.object.isRequired,
  onUpdatePosition: PropTypes.func,
  selectedBlock: PropTypes.string,
  onSelectBlock: PropTypes.func,
  isDragEnabled: PropTypes.bool,
  className: PropTypes.string,
};

GridLayout.defaultProps = {
  children: null,
  onUpdatePosition: () => {},
  selectedBlock: null,
  onSelectBlock: () => {},
  isDragEnabled: true,
  className: '',
};

export default GridLayout;