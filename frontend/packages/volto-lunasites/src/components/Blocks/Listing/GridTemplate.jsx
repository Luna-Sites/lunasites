import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { ConditionalLink, Component } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import './GridTemplate.scss';
import './CardStyles.scss';

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
  filled = true,
  maxNumberOfColumns = 3,
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

  // Helper function to check if item is a video file
  const isVideoFile = (item) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
    const fileName = item.title || item.id || '';
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) || 
           item['@type'] === 'File' && item.file?.filename && 
           videoExtensions.some(ext => item.file.filename.toLowerCase().endsWith(ext));
  };

  // Helper function to get video URL
  const getVideoUrl = (item) => {
    if (item.file?.download) {
      return item.file.download;
    }
    return item['@id'] + '/@@download/file';
  };

  // Apply manual pagination if b_size is provided
  const renderItems =
    b_size && b_size > 0
      ? items.slice((currentPage - 1) * b_size, currentPage * b_size)
      : items;

  // Smart scaling logic for responsive breakpoints
  const getResponsiveColumns = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width <= 480) {
        return Math.min(maxNumberOfColumns, 1);
      } else if (width <= 768) {
        return Math.min(maxNumberOfColumns, 2);
      } else if (width <= 1200) {
        return Math.min(maxNumberOfColumns, 4);
      }
    }
    return maxNumberOfColumns;
  };

  return (
    <>
      <Grid
        columns={getResponsiveColumns()}
        doubling
        stackable
        className="listing-grid"
      >
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
                className={`card-container card-style-${cardStyle} aspect-ratio-${imageAspectRatio} ${filled ? 'filled' : 'transparent'}`}
              >
                <div className="image-container">
                  {(item.image_field !== '' || isVideoFile(item)) && (
                    isVideoFile(item) ? (
                      <video 
                        src={getVideoUrl(item)}
                        className="item-image"
                        muted
                        loop
                        autoPlay
                      />
                    ) : (
                      <Component
                        componentName="PreviewImage"
                        item={item}
                        alt=""
                        className="item-image"
                      />
                    )
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
            <Grid.Column key={item['@id']}>
              <ConditionalLink item={item} condition={!isEditMode}>
                <ItemBodyTemplate item={item} />
              </ConditionalLink>
            </Grid.Column>
          );
        })}
      </Grid>

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
  filled: PropTypes.bool,
  maxNumberOfColumns: PropTypes.number,
};

export default GridTemplate;
