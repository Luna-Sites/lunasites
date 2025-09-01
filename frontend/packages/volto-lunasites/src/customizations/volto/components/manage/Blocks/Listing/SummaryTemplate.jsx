import React from 'react';
import PropTypes from 'prop-types';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import Component from '@plone/volto/components/theme/Component/Component';

import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';

const SummaryTemplate = ({ items, linkTitle, linkHref, isEditMode }) => {
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

  return (
    <>
      <div className="items">
        {items.map((item, index) => (
          <div className="listing-item" key={item['@id']}>
            <ConditionalLink item={item} condition={!isEditMode}>
              <Component componentName="PreviewImage" item={item} alt="" />
              <div className="listing-body">
                <h3 style={{ color: 'var(--lunasites-text-color)' }}>
                  {item.title || item.id}
                </h3>
                <p style={{ color: 'var(--lunasites-text-color)' }}>
                  {item.description}
                </p>
              </div>
            </ConditionalLink>
            {index < items.length - 1 && (
              <div
                style={{
                  borderBottom: '1px solid var(--lunasites-primary-color)',
                  margin: '1rem 0',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {link && (
        <div
          className="footer"
          style={{ color: 'var(--lunasites-text-color)' }}
        >
          {link}
        </div>
      )}
    </>
  );
};

SummaryTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkMore: PropTypes.any,
  isEditMode: PropTypes.bool,
};

export default SummaryTemplate;
