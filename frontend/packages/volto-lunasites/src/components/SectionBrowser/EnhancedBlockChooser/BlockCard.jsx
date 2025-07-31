import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';

const BlockCard = ({
  block,
  isSelected,
  onSelect,
  onInsert,
  searchQuery = '',
}) => {
  const intl = useIntl();

  const getFormatMessage = (message) =>
    intl.formatMessage({
      id: message,
      defaultMessage: message,
    });

  // Highlight search matches in text
  const highlightSearchMatch = (text, query) => {
    if (!query || !text) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi',
    );
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark key={index} className="search-highlight">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const handleClick = () => {
    // First select the block (this will check for variations)
    onSelect();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  // Show the block's icon if available
  const renderBlockPreview = () => {
    // TODO: Implement actual block rendering previews
    if (block.icon) {
      return (
        <div className="block-preview-icon">
          <Icon name={block.icon} size="24px" />
        </div>
      );
    }
    
    // Fallback to showing first letter of block title
    const fallbackLetter = getFormatMessage(block.title).charAt(0).toUpperCase();
    return (
      <div className="block-preview-fallback">
        <div className="block-letter-indicator">
          {fallbackLetter}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`block-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${getFormatMessage(block.title)} block`}
    >
      <div className="block-card-preview">
        {renderBlockPreview()}
      </div>
      <div className="block-card-title">
        {searchQuery
          ? highlightSearchMatch(getFormatMessage(block.title), searchQuery)
          : getFormatMessage(block.title)}
      </div>
      {searchQuery && block.group && (
        <div className="block-card-category">{block.group}</div>
      )}
      {isSelected && (
        <div className="block-card-insert-hint">Selected - will auto-insert or show variations</div>
      )}
    </div>
  );
};

BlockCard.propTypes = {
  block: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    group: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onInsert: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
};

BlockCard.defaultProps = {
  isSelected: false,
};

export default BlockCard;
