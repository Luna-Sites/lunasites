import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Modal, ModalOverlay } from 'react-aria-components';
import { Button, CloseIcon } from '@plone/components';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import config from '@plone/volto/registry';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

// Icons
import plusSVG from '@plone/volto/icons/circle-plus.svg';
import searchSVG from '@plone/volto/icons/zoom.svg';
import downSVG from '@plone/volto/icons/down-key.svg';
import upSVG from '@plone/volto/icons/up-key.svg';
import starSVG from '@plone/volto/icons/star.svg';

// Styles
import './CompactBlockChooser.less';

// Block categorization for better organization
const BLOCK_CATEGORIES = {
  popular: {
    id: 'popular',
    label: 'Popular',
    icon: starSVG,
    blocks: ['slate', 'image', 'teaser', 'html'],
    alwaysShow: true,
  },
  content: {
    id: 'content',
    label: 'Content',
    icon: null,
    keywords: ['text', 'content', 'slate', 'title', 'description'],
  },
  media: {
    id: 'media', 
    label: 'Media',
    icon: null,
    keywords: ['image', 'video', 'audio', 'gallery', 'media'],
  },
  layout: {
    id: 'layout',
    label: 'Layout', 
    icon: null,
    keywords: ['grid', 'column', 'container', 'spacer', 'separator'],
  },
  advanced: {
    id: 'advanced',
    label: 'Advanced',
    icon: null,
    keywords: ['html', 'embed', 'code', 'custom', 'form'],
  },
};

const categorizeBlock = (blockKey, blockConfig) => {
  const blockId = blockKey.toLowerCase();
  const title = (blockConfig.title || '').toLowerCase();
  const group = (blockConfig.group || '').toLowerCase();
  
  // Check if it's in popular blocks
  if (BLOCK_CATEGORIES.popular.blocks.includes(blockId)) {
    return 'popular';
  }
  
  // Check against category keywords
  for (const [categoryId, category] of Object.entries(BLOCK_CATEGORIES)) {
    if (categoryId === 'popular') continue;
    
    if (category.keywords.some(keyword => 
      blockId.includes(keyword) || title.includes(keyword) || group.includes(keyword)
    )) {
      return categoryId;
    }
  }
  
  // Default to content category
  return 'content';
};

const CompactBlockChooser = React.memo(
  ({
    open,
    onClose,
    onInsertBlock,
    currentBlock,
    allowedBlocks,
    showRestricted = false,
    blocksConfig,
    navRoot,
    contentType,
    isInsideGroupBlock = false,
  }) => {
    const intl = useIntl();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({
      popular: true,
      content: true,
      media: false,
      layout: false,
      advanced: false,
    });
    const [focusedBlockIndex, setFocusedBlockIndex] = useState(-1);
    const searchInputRef = React.useRef(null);

    // Get available blocks with categorization
    const availableBlocks = useMemo(() => {
      const allBlocksConfig = blocksConfig || config.blocks.blocksConfig;
      let blocks = Object.keys(allBlocksConfig).map((key) => [
        key,
        allBlocksConfig[key],
      ]);

      // Filter by allowed blocks
      if (allowedBlocks && allowedBlocks.length > 0) {
        blocks = blocks.filter(([key]) => allowedBlocks.includes(key));
      }

      // Filter restricted blocks
      if (!showRestricted) {
        blocks = blocks.filter(([key, block]) => !block.restricted);
      }

      // Filter by content type
      if (contentType) {
        blocks = blocks.filter(
          ([key, block]) =>
            !block.types || block.types.includes(contentType),
        );
      }

      // Add category information to each block
      return blocks.map(([key, block]) => ([
        key,
        {
          ...block,
          category: categorizeBlock(key, block),
        },
      ]));
    }, [allowedBlocks, showRestricted, blocksConfig, contentType]);

    // Group blocks by category and filter by search
    const { categorizedBlocks, filteredBlocks, searchCategories } = useMemo(() => {
      let blocks = availableBlocks;
      
      // Apply search filter if query exists
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        blocks = blocks.filter(([key, block]) => {
          const title = (block.title || key).toLowerCase();
          const description = (block.description || '').toLowerCase();
          const category = block.category.toLowerCase();
          const blockId = key.toLowerCase();
          
          return title.includes(query) || 
                 description.includes(query) || 
                 blockId.includes(query) ||
                 category.includes(query);
        });
      }
      
      // Group blocks by category
      const grouped = groupBy(blocks, ([key, block]) => block.category);
      
      // Extract categories for search filtering
      const categories = searchQuery.trim() ? 
        Object.keys(grouped).map(catId => BLOCK_CATEGORIES[catId]?.label || catId) : [];
      
      return {
        categorizedBlocks: grouped,
        filteredBlocks: blocks,
        searchCategories: categories,
      };
    }, [availableBlocks, searchQuery]);
    
    // Toggle category expansion
    const toggleCategory = (categoryId) => {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId],
      }));
    };
    
    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      if (searchQuery.trim()) {
        const totalBlocks = filteredBlocks.length;
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setFocusedBlockIndex(prev => 
              prev < totalBlocks - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedBlockIndex(prev => 
              prev > 0 ? prev - 1 : totalBlocks - 1
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (focusedBlockIndex >= 0 && focusedBlockIndex < totalBlocks) {
              const [blockKey] = filteredBlocks[focusedBlockIndex];
              handleBlockClick(blockKey);
            }
            break;
          case 'Escape':
            e.preventDefault();
            if (searchQuery) {
              setSearchQuery('');
              setFocusedBlockIndex(-1);
            } else {
              onClose();
            }
            break;
        }
      }
    };
    
    // Reset focused index when search changes
    React.useEffect(() => {
      setFocusedBlockIndex(-1);
    }, [searchQuery]);
    
    // Focus search input when modal opens
    React.useEffect(() => {
      if (open && searchInputRef.current) {
        // Small delay to ensure modal is fully rendered
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }, [open]);

    const handleBlockClick = (blockType) => {
      const blockData = {
        '@type': blockType,
      };
      onInsertBlock(currentBlock, blockData);
      onClose();
    };

    return (
      <ModalOverlay
        isOpen={open}
        onOpenChange={onClose}
        className={`compact-modal-overlay ${isInsideGroupBlock ? 'in-group-block' : ''}`}
        isDismissable={true}
      >
        <Modal 
          className="compact-block-chooser-modal"
          role="dialog"
          aria-labelledby="compact-modal-title"
          aria-describedby="compact-modal-description"
        >
          <div className="compact-modal-header">
            <h3 id="compact-modal-title" className="compact-modal-title">
              <Icon name={plusSVG} size="20px" aria-hidden="true" />
              <span>Add Block</span>
            </h3>
            <p id="compact-modal-description" className="sr-only">
              Choose a block to add to your content. Use arrow keys to navigate when searching.
            </p>
            <Button
              className="compact-close-button"
              aria-label="Close"
              onClick={onClose}
              isQuiet
            >
              <Icon name={CloseIcon} size="20px" />
            </Button>
          </div>

          <div className="compact-modal-content">
            <div className="compact-search-container">
              <div className="compact-search-input-wrapper">
                <Icon name={searchSVG} size="16px" className="compact-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="compact-search-input"
                  autoComplete="off"
                  role="searchbox"
                  aria-label="Search for blocks"
                  aria-describedby={searchQuery.trim() ? 'search-results-count' : undefined}
                />
              </div>
            </div>
            
            <div className="compact-blocks-container">
              {searchQuery.trim() ? (
                // Search results view
                <div>
                  {filteredBlocks.length > 0 && (
                    <div id="search-results-count" className="compact-search-results-header">
                      Found {filteredBlocks.length} block{filteredBlocks.length !== 1 ? 's' : ''}
                      {searchCategories.length > 0 && (
                        <span className="compact-search-categories">
                          {' '}in {searchCategories.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="compact-blocks-grid" role="grid" aria-label="Search results">
                    {filteredBlocks.length > 0 ? (
                      filteredBlocks.map(([key, block], index) => (
                        <button
                          key={key}
                          className={`compact-block-card ${
                            focusedBlockIndex === index ? 'focused' : ''
                          }`}
                          onClick={() => handleBlockClick(key)}
                          type="button"
                          role="gridcell"
                          aria-label={`Add ${block.title || key} block. ${block.description || ''}`}
                          tabIndex={focusedBlockIndex === index ? 0 : -1}
                        >
                          <div className="compact-block-icon">
                            {block.icon && <Icon name={block.icon} size="20px" />}
                          </div>
                          <div className="compact-block-info">
                            <h4 className="compact-block-title">
                              {block.title || key}
                            </h4>
                            {block.description && (
                              <p className="compact-block-description">
                                {block.description}
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="compact-no-results" role="status">
                        <div className="compact-no-results-icon">🔍</div>
                        <p className="compact-no-results-text">
                          No blocks found for "{searchQuery}"
                        </p>
                        <button 
                          className="compact-clear-search"
                          onClick={() => {
                            setSearchQuery('');
                            searchInputRef.current?.focus();
                          }}
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Category view
                <div>
                  {/* Quick Access Bar - Show popular blocks at the top */}
                  {categorizedBlocks.popular && categorizedBlocks.popular.length > 0 && (
                    <div className="compact-quick-access">
                      <div className="compact-quick-access-header">
                        <Icon name={starSVG} size="14px" aria-hidden="true" />
                        <span>Quick Access</span>
                      </div>
                      <div className="compact-quick-access-grid">
                        {categorizedBlocks.popular.slice(0, 6).map(([key, block]) => (
                          <button
                            key={key}
                            className="compact-quick-block"
                            onClick={() => handleBlockClick(key)}
                            type="button"
                            aria-label={`Quick add ${block.title || key} block`}
                            title={block.description || block.title || key}
                          >
                            <div className="compact-quick-block-icon">
                              {block.icon && <Icon name={block.icon} size="16px" />}
                            </div>
                            <span className="compact-quick-block-title">{block.title || key}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="compact-categories" role="tablist" aria-label="Block categories">
                  {Object.entries(BLOCK_CATEGORIES).map(([categoryId, category]) => {
                    const categoryBlocks = categorizedBlocks[categoryId] || [];
                    if (categoryBlocks.length === 0) return null;
                    
                    const isExpanded = expandedCategories[categoryId];
                    const displayBlocks = isExpanded ? categoryBlocks : categoryBlocks.slice(0, 4);
                    const hasMore = categoryBlocks.length > 4;
                    
                    return (
                      <div key={categoryId} className="compact-category">
                        <button
                          className="compact-category-header"
                          onClick={() => toggleCategory(categoryId)}
                          type="button"
                          role="tab"
                          aria-expanded={isExpanded || category.alwaysShow}
                          aria-controls={`category-${categoryId}`}
                          aria-label={`${category.label} category with ${categoryBlocks.length} blocks`}
                        >
                          <div className="compact-category-title">
                            {category.icon && <Icon name={category.icon} size="16px" />}
                            <span>{category.label}</span>
                            <span className="compact-category-count">({categoryBlocks.length})</span>
                          </div>
                          <Icon
                            name={isExpanded ? upSVG : downSVG}
                            size="14px"
                            className="compact-category-toggle"
                            aria-hidden="true"
                          />
                        </button>
                        
                        {(isExpanded || category.alwaysShow) && (
                          <div 
                            id={`category-${categoryId}`}
                            className="compact-category-content"
                            role="tabpanel"
                            aria-labelledby={`category-${categoryId}-header`}
                          >
                            <div className="compact-blocks-grid" role="grid" aria-label={`${category.label} blocks`}>
                              {displayBlocks.map(([key, block]) => (
                                <button
                                  key={key}
                                  className="compact-block-card"
                                  onClick={() => handleBlockClick(key)}
                                  type="button"
                                  role="gridcell"
                                  aria-label={`Add ${block.title || key} block. ${block.description || ''}`}
                                >
                                  <div className="compact-block-icon" aria-hidden="true">
                                    {block.icon && <Icon name={block.icon} size="20px" />}
                                  </div>
                                  <div className="compact-block-info">
                                    <h4 className="compact-block-title">
                                      {block.title || key}
                                    </h4>
                                    {block.description && (
                                      <p className="compact-block-description">
                                        {block.description}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                            
                            {hasMore && !isExpanded && (
                              <button
                                className="compact-show-more"
                                onClick={() => toggleCategory(categoryId)}
                                type="button"
                                aria-label={`Show ${categoryBlocks.length - 4} more blocks in ${category.label} category`}
                              >
                                Show {categoryBlocks.length - 4} more blocks
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </ModalOverlay>
    );
  },
);

CompactBlockChooser.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onInsertBlock: PropTypes.func.isRequired,
  currentBlock: PropTypes.string.isRequired,
  allowedBlocks: PropTypes.arrayOf(PropTypes.string),
  showRestricted: PropTypes.bool,
  blocksConfig: PropTypes.objectOf(PropTypes.any),
  navRoot: PropTypes.string,
  contentType: PropTypes.string,
  isInsideGroupBlock: PropTypes.bool,
};

CompactBlockChooser.defaultProps = {
  allowedBlocks: null,
  showRestricted: false,
  blocksConfig: null,
  navRoot: null,
  contentType: null,
  isInsideGroupBlock: false,
};

export default CompactBlockChooser;