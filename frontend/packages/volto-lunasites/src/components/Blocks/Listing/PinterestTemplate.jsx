import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalLink, Component } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import './PinterestTemplate.scss';

const PinterestTemplate = ({ items, linkTitle, linkHref, isEditMode }) => {
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
  console.log({ renderItems }, items);

  return (
    <>
      <div className="pinterest-gallery">
        {renderItems.map((item) => {
          return (
            <div className="pinterest-item" key={item['@id']}>
              <ConditionalLink item={item} condition={!isEditMode}>
                <div className="pinterest-card">
                  <div className="image-container">
                    <Component
                      componentName="PreviewImage"
                      item={item}
                      alt={item.title || ''}
                      className="pinterest-image"
                    />
                    <div className="overlay">
                      <div className="overlay-content">
                        <h3 className="item-title">{item.title}</h3>
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
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
};

export default PinterestTemplate;
