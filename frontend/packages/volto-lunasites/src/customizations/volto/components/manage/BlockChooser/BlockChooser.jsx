import React from 'react';
import useUser from '@plone/volto/hooks/user/useUser';
import PropTypes from 'prop-types';
import filter from 'lodash/filter';
import map from 'lodash/map';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import { useIntl, defineMessages } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import config from '@plone/volto/registry';
import downSVG from '@plone/volto/icons/down-key.svg';
import upSVG from '@plone/volto/icons/up-key.svg';
import { FormattedMessage } from 'react-intl';

// Styles
import './ModernBlockChooser.less';

const messages = defineMessages({
  fold: {
    id: 'Fold',
    defaultMessage: 'Fold',
  },
  unfold: {
    id: 'Unfold',
    defaultMessage: 'Unfold',
  },
});

const BlockChooser = ({
  currentBlock,
  onInsertBlock,
  onMutateBlock,
  allowedBlocks,
  showRestricted,
  blocksConfig = config.blocks.blocksConfig,
  blockChooserRef,
  properties = {},
  navRoot,
  contentType,
}) => {
  const intl = useIntl();
  const user = useUser();
  const hasAllowedBlocks = !isEmpty(allowedBlocks);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openSections, setOpenSections] = React.useState({});

  const filteredBlocksConfig = filter(blocksConfig, (item) => {
    // Check if the block is well formed (has at least id and title)
    const blockIsWellFormed = Boolean(item.title && item.id);
    if (!blockIsWellFormed) {
      return false;
    }

    // Filter by allowed blocks
    if (hasAllowedBlocks && !allowedBlocks.includes(item.id)) {
      return false;
    }

    // Filter restricted blocks
    if (!showRestricted && item.restricted) {
      return false;
    }

    // Filter by content type
    if (contentType && item.types && !item.types.includes(contentType)) {
      return false;
    }

    // Filter by permissions
    const requiredPermission = item.addPermission;
    if (requiredPermission && user.roles && !user.roles.includes('Manager')) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const title = (item.title || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      const group = (item.group || '').toLowerCase();
      
      return title.includes(term) || description.includes(term) || group.includes(term) || item.id.toLowerCase().includes(term);
    }

    return true;
  });

  const groupedBlocks = groupBy(filteredBlocksConfig, 'group');
  const groupKeys = Object.keys(groupedBlocks).sort();

  const toggleSection = (groupName) => {
    setOpenSections(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  React.useEffect(() => {
    // Open all sections by default
    const initialOpen = {};
    groupKeys.forEach(key => {
      initialOpen[key] = true;
    });
    setOpenSections(initialOpen);
  }, [groupKeys.length]);

  const handleBlockClick = (blockType) => {
    const blockData = { '@type': blockType };
    if (onInsertBlock) {
      onInsertBlock(currentBlock, blockData);
    } else if (onMutateBlock) {
      onMutateBlock(currentBlock, blockData);
    }
  };

  return (
    <div className="modern-block-chooser" ref={blockChooserRef}>
      <div className="modern-block-chooser-header">
        <h3 className="modern-block-chooser-title">Add Block</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="modern-block-chooser-content">
        {groupKeys.length === 0 ? (
          <div className="no-blocks-message">
            {searchTerm ? (
              <div>
                <p>No blocks found for "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                  Clear search
                </button>
              </div>
            ) : (
              <p>No blocks available</p>
            )}
          </div>
        ) : (
          groupKeys.map((group) => (
            <div key={group} className="block-group">
              <button
                className="group-header"
                onClick={() => toggleSection(group)}
                type="button"
              >
                <span className="group-title">
                  {group || 'Other'}
                </span>
                <Icon
                  name={openSections[group] ? upSVG : downSVG}
                  size="18px"
                  className="toggle-icon"
                />
              </button>
              
              {openSections[group] && (
                <div className="blocks-grid">
                  {map(groupedBlocks[group], (block) => (
                    <button
                      key={block.id}
                      className="modern-block-card"
                      onClick={() => handleBlockClick(block.id)}
                      type="button"
                      title={block.description}
                    >
                      <div className="block-icon">
                        {block.icon && <Icon name={block.icon} size="24px" />}
                      </div>
                      <div className="block-info">
                        <h4 className="block-title">{block.title}</h4>
                        {block.description && (
                          <p className="block-description">{block.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

BlockChooser.propTypes = {
  currentBlock: PropTypes.string.isRequired,
  onInsertBlock: PropTypes.func,
  onMutateBlock: PropTypes.func,
  allowedBlocks: PropTypes.arrayOf(PropTypes.string),
  showRestricted: PropTypes.bool,
  blocksConfig: PropTypes.objectOf(PropTypes.any),
  blockChooserRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  properties: PropTypes.objectOf(PropTypes.any),
  navRoot: PropTypes.string,
  contentType: PropTypes.string,
};

BlockChooser.defaultProps = {
  onInsertBlock: null,
  onMutateBlock: null,
  allowedBlocks: null,
  showRestricted: false,
  blocksConfig: config.blocks.blocksConfig,
  blockChooserRef: null,
  properties: {},
  navRoot: null,
  contentType: null,
};

export default BlockChooser;