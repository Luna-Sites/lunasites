import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalLink, Component } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import './GridTemplate.scss';

const GridTemplate = ({
  items,
  linkTitle,
  linkHref,
  isEditMode,
  b_size,
  currentPage = 1,
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

  // Helper functions
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  // Apply manual pagination if b_size is provided
  const renderItems =
    b_size && b_size > 0
      ? items.slice((currentPage - 1) * b_size, currentPage * b_size)
      : items;

  return (
    <>
      <div className="items">
        {renderItems.map((item) => {
          const ItemBodyTemplate = () => {
            const hasType = item['@type'];
            const CustomItemBodyTemplate = config.getComponent({
              name: 'GridListingItemTemplate',
              dependencies: [hasType],
            }).component;

            return CustomItemBodyTemplate ? (
              <CustomItemBodyTemplate item={item} />
            ) : (
              <div
                className={`card-container card-style-${cardStyle} aspect-ratio-${imageAspectRatio}`}
              >
                <div className="image-container">
                  {item.image_field !== '' && (
                    <Component
                      componentName="PreviewImage"
                      item={item}
                      alt=""
                      className="item-image"
                    />
                  )}
                  {cardStyle === 'overlay' && (
                    <div className="overlay">
                      <div className="overlay-content">
                        {item?.head_title && (
                          <div className="headline">{item.head_title}</div>
                        )}
                        {showTitle && (
                          <h2>{truncateText(item?.title, titleLength)}</h2>
                        )}
                        {showDescription &&
                          !item.hide_description &&
                          item?.description && (
                            <p>
                              {truncateText(
                                item.description,
                                descriptionLength,
                              )}
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
                {cardStyle === 'default' && (
                  <div className="card-content">
                    {item?.head_title && (
                      <div className="headline">{item.head_title}</div>
                    )}
                    {showTitle && (
                      <h2>{truncateText(item?.title, titleLength)}</h2>
                    )}
                    {showDescription &&
                      !item.hide_description &&
                      item?.description && (
                        <p>
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
            );
          };
          return (
            <div className="listing-item" key={item['@id']}>
              <ConditionalLink item={item} condition={!isEditMode}>
                <ItemBodyTemplate item={item} />
              </ConditionalLink>
            </div>
          );
        })}
      </div>

      {link && <div className="footer">{link}</div>}
    </>
  );
};

GridTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkTitle: PropTypes.string,
  linkHref: PropTypes.arrayOf(PropTypes.any),
  isEditMode: PropTypes.bool,
  b_size: PropTypes.number,
  currentPage: PropTypes.number,
  showTitle: PropTypes.bool,
  showDescription: PropTypes.bool,
  showDate: PropTypes.bool,
  showAuthor: PropTypes.bool,
  titleLength: PropTypes.number,
  descriptionLength: PropTypes.number,
  imageAspectRatio: PropTypes.string,
  cardStyle: PropTypes.string,
};

export default GridTemplate;
