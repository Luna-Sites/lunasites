import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalLink, Component } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { isInternalURL } from '@plone/volto/helpers/Url/Url';

const GridTemplate = ({ items, linkTitle, linkHref, isEditMode, b_size, currentPage = 1 }) => {
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
              <div className="card-container">
                {item.image_field !== '' && (
                  <Component
                    componentName="PreviewImage"
                    item={item}
                    alt=""
                    className="item-image"
                  />
                )}
                <div className="item">
                  <div className="content">
                    {item?.head_title && (
                      <div className="headline">{item.head_title}</div>
                    )}

                    <h2>{item?.title}</h2>
                    {!item.hide_description && <p>{item?.description}</p>}
                  </div>
                </div>
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
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
  b_size: PropTypes.number,
  currentPage: PropTypes.number,
};

export default GridTemplate;
