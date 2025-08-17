import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

// Component imports
import { Button } from '@plone/components';

// Styles
import './PageTemplateStyles.less';

const PageTemplateCard = React.memo(({ pageTemplate, onSelect }) => {
  const handleSelect = useCallback(
    (e) => {
      // Prevent the parent div's onClick from firing
      e.stopPropagation();
      onSelect(pageTemplate);
    },
    [pageTemplate, onSelect],
  );

  const handleCardClick = useCallback(() => {
    onSelect(pageTemplate);
  }, [pageTemplate, onSelect]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        onSelect(pageTemplate);
      }
    },
    [pageTemplate, onSelect],
  );

  return (
    // The entire card is clickable
    <div
      className={`page-template-card ${pageTemplate.featured ? 'featured' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="page-thumbnail">
        <img
          src={pageTemplate.thumbnail}
          alt={pageTemplate.title}
          onError={(e) => {
            // Add a fallback for broken images
            e.currentTarget.src =
              'https://placehold.co/400x300/e0e0e0/757575?text=Preview';
          }}
        />
        <div className="page-overlay">
          <Button variant="primary" size="small" onClick={handleSelect}>
            Create Page
          </Button>
        </div>
      </div>
      <div className="page-card-content">
        <h4 className="page-card-header">{pageTemplate.title}</h4>
        <p className="page-card-description">{pageTemplate.description}</p>
        <div className="page-card-meta">
          <span className="page-type">{pageTemplate.contentType}</span>
          {pageTemplate.featured && <span className="featured-badge">Featured</span>}
        </div>
      </div>
    </div>
  );
});

PageTemplateCard.propTypes = {
  pageTemplate: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    thumbnail: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired,
    category: PropTypes.string,
    featured: PropTypes.bool,
    template: PropTypes.func.isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default PageTemplateCard;