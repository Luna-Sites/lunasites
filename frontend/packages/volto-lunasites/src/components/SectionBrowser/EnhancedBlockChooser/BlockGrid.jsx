import React from 'react';
import PropTypes from 'prop-types';
import BlockCard from './BlockCard';

const BlockGrid = ({
  blocks,
  selectedBlock,
  onBlockSelect,
  onBlockInsert,
  isSearchActive = false,
  searchQuery = '',
}) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="block-grid-empty">
        {isSearchActive ? (
          <>
            <div className="empty-message">No blocks found</div>
            <div className="empty-description">
              No blocks match your search for "{searchQuery}"
            </div>
          </>
        ) : (
          <>
            <div className="empty-message">No blocks available</div>
            <div className="empty-description">
              No blocks available in this category.
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`block-grid ${isSearchActive ? 'search-active' : ''}`}>
      {isSearchActive && (
        <div className="search-header-info">
          <span className="search-context">Searching all blocks</span>
        </div>
      )}
      <div className="block-grid-container">
        {blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            isSelected={selectedBlock && selectedBlock.id === block.id}
            onSelect={() => onBlockSelect(block)}
            onInsert={() => onBlockInsert(block)}
            searchQuery={isSearchActive ? searchQuery : ''}
          />
        ))}
      </div>
    </div>
  );
};

BlockGrid.propTypes = {
  blocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.string,
    }),
  ).isRequired,
  selectedBlock: PropTypes.object,
  onBlockSelect: PropTypes.func.isRequired,
  onBlockInsert: PropTypes.func.isRequired,
  isSearchActive: PropTypes.bool,
  searchQuery: PropTypes.string,
};

export default BlockGrid;
