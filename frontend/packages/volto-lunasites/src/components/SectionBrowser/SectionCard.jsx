import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

// Component imports
import { Button } from '@plone/components';

// Styles
import './SectionStyles.less';

const SectionCard = React.memo(({ section, onInsert }) => {
  const handleInsert = useCallback(
    (e) => {
      // Prevent the parent div's onClick from firing
      e.stopPropagation();
      onInsert(section);
    },
    [section, onInsert],
  );

  const handleCardClick = useCallback(() => {
    onInsert(section);
  }, [section, onInsert]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        onInsert(section);
      }
    },
    [section, onInsert],
  );

  return (
    // Replaced <Card> with a styled <div>. The entire card is now clickable.
    <div
      className="section-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="section-thumbnail">
        {/* Replaced <Image> with a standard <img> tag */}
        <img
          src={section.thumbnail}
          alt={section.title}
          onError={(e) => {
            // Add a fallback for broken images
            e.currentTarget.src =
              'https://placehold.co/400x300/e0e0e0/757575?text=Preview';
          }}
        />
        <div className="section-overlay">
          <Button variant="primary" size="small" onClick={handleInsert}>
            Insert Section
          </Button>
        </div>
      </div>
      <div className="section-card-content">
        <h4 className="section-card-header">{section.title}</h4>
        <p className="section-card-description">{section.description}</p>
      </div>
    </div>
  );
});

SectionCard.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    category: PropTypes.string,
    template: PropTypes.func.isRequired,
  }).isRequired,
  onInsert: PropTypes.func.isRequired,
};

export default SectionCard;
