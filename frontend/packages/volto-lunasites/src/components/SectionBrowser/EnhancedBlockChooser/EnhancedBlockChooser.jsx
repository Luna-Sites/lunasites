import React, { useState, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Lodash utilities
import filter from 'lodash/filter';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

// Volto hooks and config
import useUser from '@plone/volto/hooks/user/useUser';
import config from '@plone/volto/registry';

// Local component imports
import BlockGrid from './BlockGrid';
import VariationModal from './VariationModal';

// Styles
import './EnhancedBlockChooser.less';

const EnhancedBlockChooser = ({
  currentBlock,
  onInsertBlock,
  onMutateBlock,
  allowedBlocks,
  showRestricted,
  blocksConfig = config.blocks.blocksConfig,
  properties = {},
  navRoot,
  contentType,
  blockChooserRef,
}) => {
  const user = useUser();
  const hasAllowedBlocks = !isEmpty(allowedBlocks);

  // State management
  const [selectedCategory, setSelectedCategory] = useState('mostUsed');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const searchInputRef = useRef(null);

  // Filter blocks based on permissions and restrictions
  const filteredBlocksConfig = useMemo(() => {
    return filter(blocksConfig, (item) => {
      // Check if the block is well formed (has at least id and title)
      const blockIsWellFormed = Boolean(item.title && item.id);
      if (!blockIsWellFormed) {
        return false;
      }

      if (showRestricted) {
        if (hasAllowedBlocks) {
          return allowedBlocks.includes(item.id);
        } else {
          return true;
        }
      } else {
        if (hasAllowedBlocks) {
          return allowedBlocks.includes(item.id);
        } else {
          // Overload restricted as a function, so we can decide the availability of a block
          // depending on this function, given properties and the block being evaluated
          return typeof item.restricted === 'function'
            ? !item.restricted({
                properties,
                block: item,
                navRoot,
                contentType,
                user,
              })
            : !item.restricted;
        }
      }
    });
  }, [
    blocksConfig,
    showRestricted,
    hasAllowedBlocks,
    allowedBlocks,
    properties,
    navRoot,
    contentType,
    user,
  ]);

  // Group blocks by category
  const blocksAvailable = useMemo(() => {
    let available = {};

    // Add mostUsed blocks if they exist
    const mostUsedBlocks = filter(
      filteredBlocksConfig,
      (item) => item.mostUsed,
    );
    if (mostUsedBlocks.length > 0) {
      available.mostUsed = mostUsedBlocks;
    }

    // Group remaining blocks by their group property
    const groupedBlocks = groupBy(filteredBlocksConfig, (item) => item.group);
    available = {
      ...available,
      ...groupedBlocks,
    };

    return available;
  }, [filteredBlocksConfig]);

  // Get available categories based on configured group order
  const availableCategories = useMemo(() => {
    return filter(config.blocks.groupBlocksOrder, (item) =>
      Object.keys(blocksAvailable).includes(item.id),
    );
  }, [blocksAvailable]);

  // Filter blocks by search query
  const searchFilteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredBlocksConfig;
    }

    const query = searchQuery.toLowerCase().trim();
    return filter(filteredBlocksConfig, (block) => {
      // Search in title
      if (block.title && block.title.toLowerCase().includes(query)) {
        return true;
      }

      // Search in block ID
      if (block.id && block.id.toLowerCase().includes(query)) {
        return true;
      }

      // Search in group name
      if (block.group && block.group.toLowerCase().includes(query)) {
        return true;
      }

      // Search in variations
      if (block.variations && Array.isArray(block.variations)) {
        return block.variations.some((variation) => {
          return (
            variation.title && variation.title.toLowerCase().includes(query)
          );
        });
      }

      return false;
    });
  }, [filteredBlocksConfig, searchQuery]);

  // Get blocks for the currently selected category (with search filtering)
  const currentCategoryBlocks = useMemo(() => {
    if (isSearchActive && searchQuery.trim()) {
      return searchFilteredBlocks;
    }
    return blocksAvailable[selectedCategory] || [];
  }, [
    blocksAvailable,
    selectedCategory,
    searchFilteredBlocks,
    isSearchActive,
    searchQuery,
  ]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedBlock(null); // Clear selected block when changing category
    // Clear search when switching categories
    if (isSearchActive) {
      setSearchQuery('');
      setIsSearchActive(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearchActive(query.trim().length > 0);
    setSelectedBlock(null); // Clear selected block when searching
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    setSelectedBlock(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }

      // Escape to clear search
      if (e.key === 'Escape' && isSearchActive) {
        handleSearchClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchActive]);

  const handleBlockSelect = (block) => {
    // Check if block has meaningful variations (excluding 'default' titles)
    const meaningfulVariations =
      block.variations?.filter(
        (variation) => !variation.title.toLowerCase().includes('default'),
      ) || [];

    const hasMultipleVariations = meaningfulVariations.length > 0;

    if (hasMultipleVariations) {
      setSelectedBlock(block);
      setShowVariationModal(true);
    } else {
      // Insert block directly - either no variations or only default variation
      handleBlockInsert(block, null);
    }
  };

  const handleBlockInsert = (block, variation = null) => {
    let blockData = {
      '@type': block.id,
    };

    // If there's a variation, add the variation identifier
    if (variation) {
      blockData.variation = variation.id;
    }

    // Use onInsertBlock if available, otherwise fall back to onMutateBlock
    if (onInsertBlock) {
      onInsertBlock(currentBlock, blockData);
    } else if (onMutateBlock) {
      onMutateBlock(currentBlock, blockData);
    } else {
      console.error('EnhancedBlockChooser: No insertion callback available!');
    }
  };

  const handleVariationInsert = (variation) => {
    if (selectedBlock) {
      handleBlockInsert(selectedBlock, variation);
      setShowVariationModal(false);
      setSelectedBlock(null);
    }
  };

  const handleCloseVariationModal = () => {
    setShowVariationModal(false);
    setSelectedBlock(null);
  };

  return (
    <div className="enhanced-block-chooser" ref={blockChooserRef}>
      <div className="enhanced-block-chooser-layout">
        <div className="search-header">
          {/* Category tabs on the left - always reserve space */}
          <div className="category-tabs-header">
            {!isSearchActive &&
              availableCategories.map((category) => (
                <button
                  key={category.id}
                  className={`category-tab-header ${
                    selectedCategory === category.id ? 'selected' : ''
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.title}
                </button>
              ))}
          </div>

          {/* Search container in the middle */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search blocks... (Ctrl+F)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="search-clear"
                  aria-label="Clear search"
                >
                  <span>✕</span>
                </button>
              )}
            </div>
            {isSearchActive && (
              <div className="search-results-count">
                {currentCategoryBlocks.length} result
                {currentCategoryBlocks.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Empty spacer on the right to balance layout */}
          <div className="header-spacer"></div>
        </div>

        <div className="blocks-section-full">
          <BlockGrid
            blocks={currentCategoryBlocks}
            selectedBlock={selectedBlock}
            onBlockSelect={handleBlockSelect}
            onBlockInsert={handleBlockInsert}
            isSearchActive={isSearchActive}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Variation Modal */}
      {showVariationModal && selectedBlock && (
        <VariationModal
          block={selectedBlock}
          onVariationInsert={handleVariationInsert}
          onClose={handleCloseVariationModal}
        />
      )}
    </div>
  );
};

EnhancedBlockChooser.propTypes = {
  currentBlock: PropTypes.string.isRequired,
  onInsertBlock: PropTypes.func,
  onMutateBlock: PropTypes.func,
  allowedBlocks: PropTypes.arrayOf(PropTypes.string),
  showRestricted: PropTypes.bool,
  blocksConfig: PropTypes.objectOf(PropTypes.any),
  properties: PropTypes.object,
  navRoot: PropTypes.string,
  contentType: PropTypes.string,
};

EnhancedBlockChooser.defaultProps = {
  showRestricted: false,
  properties: {},
};

export default React.forwardRef((props, ref) => (
  <EnhancedBlockChooser {...props} blockChooserRef={ref} />
));
