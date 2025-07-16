import React from 'react';
import { Button } from 'semantic-ui-react';
import { ConditionalLink, MaybeWrap } from '@plone/volto/components';
import { isInternalURL } from '@plone/volto/helpers';
import cx from 'classnames';

/**
 * Calculate the contrast ratio and return the best text color (black or white)
 * Based on WCAG contrast ratio guidelines
 */
const getContrastTextColor = (backgroundColor) => {
  if (!backgroundColor) return '#000000';

  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const View = (props) => {
  const { data, isEditMode, className, style } = props;

  const href = data.href?.[0];
  const isInternal = isInternalURL(href?.['@id'] || href) || !href;
  const target = data.openLinkInNewTab ? '_blank' : null;
  const rel = data.openLinkInNewTab ? 'noopener noreferrer' : null;

  // Apply block-specific styling from specificStyles (block-specific) not styles (general)
  const buttonColor = data.styles?.buttonColor;
  const filled = data.styles?.filled !== false; // Default to true if not specified
  const width = data.styles?.width;
  // Create button styles based on block-specific configuration
  const buttonStyles = {
    ...style,
    width: undefined,
  };

  // Create container styles with CSS variables for width
  const containerStyles = {
    ...(width && { '--button-width': width }),
  };

  if (buttonColor) {
    if (filled) {
      // Filled button with custom color
      buttonStyles.backgroundColor = buttonColor;
      buttonStyles.borderColor = buttonColor;
      // Calculate contrast-based text color
      buttonStyles.color = getContrastTextColor(buttonColor);
    } else {
      // Outline button with custom color
      buttonStyles.backgroundColor = 'transparent';
      buttonStyles.borderColor = buttonColor;
      buttonStyles.color = buttonColor;
      // Set CSS variables for hover effect
      buttonStyles['--button-hover-color'] = buttonColor;
      buttonStyles['--button-hover-text-color'] =
        getContrastTextColor(buttonColor);
    }
  }

  // Add hover effects through CSS classes
  const buttonClasses = cx(
    'ui button',
    {
      'button-filled': filled,
      'button-outline': !filled,
      'button-custom-color': buttonColor,
    },
    className,
  );

  return (
    <MaybeWrap
      condition={!__SERVER__}
      as="div"
      className={cx('block __button', {
        [data.align]: data.align,
      })}
      style={containerStyles}
    >
      <div className={cx('align', data.inneralign)}>
        <ConditionalLink
          to={href}
          condition={href}
          openLinkInNewTab={data.openLinkInNewTab}
        >
          <Button
            as={href ? 'a' : 'div'}
            href={isInternal ? null : href}
            target={target}
            rel={rel}
            className={buttonClasses}
            style={buttonStyles}
            data-filled={filled}
            data-custom-color={buttonColor}
          >
            {data.title || 'Button'}
          </Button>
        </ConditionalLink>
      </div>
    </MaybeWrap>
  );
};

export default View;
