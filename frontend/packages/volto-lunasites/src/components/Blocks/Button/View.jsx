import React from 'react';
import { UniversalLink } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import './Button.scss';

const View = (props) => {
  const { data } = props;
  const lunaTheming = useSelector((state) => state.lunaTheming);
  
  // Get colors from global theme
  const colors = lunaTheming?.data?.colors || {};
  const getColorValue = (colorKey) => colors[colorKey] || '#666666';
  
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

  // Generate inline styles based on global theme colors
  const getButtonStyles = () => {
    const colorType = data.color || 'primary';
    const buttonType = data.buttonType || 'filled';
    
    const colorMap = {
      primary: {
        main: getColorValue('primary_color'),
        text: getColorValue('tertiary_color'),
      },
      secondary: {
        main: getColorValue('secondary_color'), 
        text: getColorValue('tertiary_color'),
      },
      tertiary: {
        main: getColorValue('tertiary_color'),
        text: getColorValue('neutral_color'),
      },
      neutral: {
        main: getColorValue('neutral_color'),
        text: getColorValue('tertiary_color'),
      },
      background: {
        main: getColorValue('background_color'),
        text: getColorValue('neutral_color'),
      },
    };

    const selectedColors = colorMap[colorType] || colorMap.primary;

    switch (buttonType) {
      case 'filled':
        return {
          backgroundColor: selectedColors.main,
          color: selectedColors.text,
          borderColor: selectedColors.main,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: selectedColors.main,
          borderColor: selectedColors.main,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: selectedColors.main,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: selectedColors.main,
          color: selectedColors.text,
          borderColor: selectedColors.main,
        };
    }
  };

  const inlineStyles = getButtonStyles();

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
          style={inlineStyles}
        >
          <ButtonContent />
        </UniversalLink>
      ) : (
        <div className={buttonClasses} style={inlineStyles}>
          <ButtonContent />
        </div>
      )}
    </div>
  );
};

export default View;