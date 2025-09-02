import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalLink, Component } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import './InlineTemplate.scss';

const InlineTemplate = ({
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
  showImage = true,
  imagePlacement = 'left',
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

  return (
    <>
      <div className="items">
        {items.map((item) => {
          const hasType = item['@type'];
          const CustomItemBodyTemplate = config.getComponent({
            name: 'InlineListingItemTemplate',
            dependencies: [hasType],
          }).component;

          const ItemBodyTemplate = () =>
            CustomItemBodyTemplate ? (
              <CustomItemBodyTemplate item={item} />
            ) : (
              <div
                className={`inline-item ${imagePlacement === 'right' ? 'image-right' : 'image-left'}`}
              >
                {showImage && (
                  isVideoFile(item) ? (
                    <video 
                      src={getVideoUrl(item)}
                      className="inline-image"
                      muted
                      loop
                      autoPlay
                      style={{
                        width: '150px',
                        height: 'auto',
                        borderRadius: '4px',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Component
                      componentName="PreviewImage"
                      item={item}
                      alt=""
                      className="inline-image"
                    />
                  )
                )}
                <div className="listing-body">
                  {showTitle && (
                    <h3>
                      {truncateText(
                        item.title ? item.title : item.id,
                        titleLength,
                      )}
                    </h3>
                  )}
                  {showDescription && item.description && (
                    <p>{truncateText(item.description, descriptionLength)}</p>
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
            );
          return (
            <div
              className={`listing-item card-style-${cardStyle} aspect-ratio-${imageAspectRatio}`}
              key={item['@id']}
            >
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

InlineTemplate.propTypes = {
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
  showImage: PropTypes.bool,
  imagePlacement: PropTypes.string,
};

export default InlineTemplate;
