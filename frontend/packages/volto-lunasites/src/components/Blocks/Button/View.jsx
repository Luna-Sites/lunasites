import React from 'react';
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

  // Simple button without link functionality
  return (
    <div className={wrapperClasses}>
      <div className={buttonClasses}>
        <span className="luna-button__text">{buttonText}</span>
      </div>
    </div>
  );
};

export default View;