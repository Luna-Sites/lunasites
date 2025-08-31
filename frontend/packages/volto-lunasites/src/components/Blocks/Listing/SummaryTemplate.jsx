import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalLink, Component } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { isInternalURL } from '@plone/volto/helpers/Url/Url';

const SummaryTemplate = ({ 
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
      <div className="items">
        {items.map((item) => {
          const hasType = item['@type'];
          const CustomItemBodyTemplate = config.getComponent({
            name: 'SummaryListingItemTemplate',
            dependencies: [hasType],
          }).component;

          const ItemBodyTemplate = () =>
            CustomItemBodyTemplate ? (
              <CustomItemBodyTemplate item={item} />
            ) : (
              <>
                <Component componentName="PreviewImage" item={item} alt="" />
                <div className="listing-body">
                  {showTitle && (
                    <h3>{truncateText(item.title ? item.title : item.id, titleLength)}</h3>
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
              </>
            );
          return (
            <div className={`listing-item card-style-${cardStyle} aspect-ratio-${imageAspectRatio}`} key={item['@id']}>
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

SummaryTemplate.propTypes = {
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

export default SummaryTemplate;
