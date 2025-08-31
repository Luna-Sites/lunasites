import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalLink, Component } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import './PinterestTemplate.scss';

const PinterestTemplate = ({ 
  items, 
  linkTitle, 
  linkHref, 
  isEditMode,
  showTitle = true,
  showDescription = true,
  showDate = false,
  showAuthor = false,
  titleLength = 50,
  descriptionLength = 100,
  imageAspectRatio = 'auto',
  cardStyle = 'default',
}) => {
  let link = null;
  let href = linkHref?.[0]?.['@id'] || '';

  if (isInternalURL(href)) {
    link = (
      <ConditionalLink to={flattenToAppURL(href)} condition={!isEditMode}>
        {linkTitle || href}
      </ConditionalLink>
    );
  } else if (href) {
    link = <a href={href}>{linkTitle || href}</a>;
  }

  const { settings } = config;
  const renderItems = items.filter(
    (content) =>
      settings.imageObjects.includes(content['@type']) &&
      (content.image_field || content.preview_image || content.image),
  );

  // Helper functions
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <>
      <div className="pinterest-gallery">
        {renderItems.map((item) => {
          return (
            <div className={`pinterest-item card-style-${cardStyle}`} key={item['@id']}>
              <ConditionalLink item={item} condition={!isEditMode}>
                <div className={`pinterest-card aspect-ratio-${imageAspectRatio}`}>
                  <div className="image-container">
                    <Component
                      componentName="PreviewImage"
                      item={item}
                      alt={item.title || ''}
                      className="pinterest-image"
                    />
                    {cardStyle === 'overlay' && (
                      <div className="overlay">
                        <div className="overlay-content">
                          {showTitle && (
                            <h3 className="item-title">
                              {truncateText(item.title, titleLength)}
                            </h3>
                          )}
                          {showDescription && item.description && (
                            <p className="item-description">
                              {truncateText(item.description, descriptionLength)}
                            </p>
                          )}
                          {showDate && item.effective && (
                            <div className="item-date">
                              {formatDate(item.effective)}
                            </div>
                          )}
                          {showAuthor && item.creators && (
                            <div className="item-author">
                              By {item.creators.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {cardStyle !== 'overlay' && (
                    <div className="card-content">
                      {showTitle && (
                        <h3 className="item-title">
                          {truncateText(item.title, titleLength)}
                        </h3>
                      )}
                      {showDescription && item.description && (
                        <p className="item-description">
                          {truncateText(item.description, descriptionLength)}
                        </p>
                      )}
                      {showDate && item.effective && (
                        <div className="item-date">
                          {formatDate(item.effective)}
                        </div>
                      )}
                      {showAuthor && item.creators && (
                        <div className="item-author">
                          By {item.creators.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ConditionalLink>
            </div>
          );
        })}
      </div>

      {link && <div className="footer">{link}</div>}
    </>
  );
};

PinterestTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkTitle: PropTypes.string,
  linkHref: PropTypes.arrayOf(PropTypes.any),
  isEditMode: PropTypes.bool,
  showTitle: PropTypes.bool,
  showDescription: PropTypes.bool,
  showDate: PropTypes.bool,
  showAuthor: PropTypes.bool,
  titleLength: PropTypes.number,
  descriptionLength: PropTypes.number,
  imageAspectRatio: PropTypes.string,
  cardStyle: PropTypes.string,
};

export default PinterestTemplate;
