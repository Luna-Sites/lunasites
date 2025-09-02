import React from 'react';
import { UniversalLink } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import cx from 'classnames';
import './Button.scss';

const View = (props) => {
  const { data } = props;
  
  // Determine button classes based on configuration
  const buttonClasses = cx('luna-button', {
    [`luna-button--${data.buttonType || 'filled'}`]: true,
    [`luna-button--${data.size || 'm'}`]: true,
    [`luna-button--${data.color || 'primary'}`]: data.color,
    'luna-button--full': data.width === 'full',
    'luna-button--fit': data.width === 'fit',
  });

  // Determine alignment classes
  const wrapperClasses = cx('luna-button-wrapper', {
    [`align-${data.align || 'left'}`]: true,
  });

  const buttonText = data.text || 'Button';
  
  // Handle href from object_browser widget
  const href = data.href?.[0]?.['@id'] || data.href;

  // Render button with or without link
  const ButtonContent = () => (
    <span className="luna-button__text">{buttonText}</span>
  );

  return (
    <div className={wrapperClasses}>
      {href ? (
        <UniversalLink
          href={flattenToAppURL(href)}
          openLinkInNewTab={data.openInNewTab}
          className={buttonClasses}
        >
          <ButtonContent />
        </UniversalLink>
      ) : (
        <div className={buttonClasses}>
          <ButtonContent />
        </div>
      )}
    </div>
  );
};

export default View;