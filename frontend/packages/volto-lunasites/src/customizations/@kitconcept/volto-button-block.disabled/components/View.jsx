import React from 'react';
import { Button } from 'semantic-ui-react';
import { MaybeWrap } from '@plone/volto/components';
import { isInternalURL, getFieldURL } from '@plone/volto/helpers';
import cx from 'classnames';
import { BlockResizeHandles } from '../../../../components/CustomSectionBlock/BlockResizeHandler';
import { getResizeConfig } from '../../../../components/CustomSectionBlock/contentResizeConfig';

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

/**
 * Get the full Remix icon class name
 */
const getIconClass = (iconName) => {
  if (!iconName) return '';
  // Add 'ri-' prefix if not already present
  return iconName.startsWith('ri-') ? iconName : `ri-${iconName}`;
};

const View = (props) => {
  const { data, isEditMode, className, style, selected, block, onChangeBlock } =
    props;

  const href = getFieldURL(data.href?.[0]);
  const isInternal = isInternalURL(href) || !href;
  const target = data.openLinkInNewTab ? '_blank' : null;
  const rel = data.openLinkInNewTab ? 'noopener noreferrer' : null;

  // Apply block-specific styling from specificStyles (block-specific) not styles (general)
  const buttonColor = data.styles?.buttonColor;
  const textColor = data.styles?.textColor;
  const filled = data.styles?.filled !== false; // Default to true if not specified
  const width = data.styles?.width;
  const borderRadius = data.styles?.borderRadius;

  // Apply size properties from data (new resize functionality)
  const fontSize = data.fontSize || 16;
  const padding = data.padding || 12;
  const buttonWidth = data.buttonWidth || 'auto';

  // Icons from main schema (not styles)
  const leftIcon = data.leftIcon;
  const rightIcon = data.rightIcon;

  // Create button styles based on block-specific configuration
  const buttonStyles = {
    ...style,
    width: undefined,
    fontSize: `${fontSize}px`,
    padding: `${padding}px`,
    ...(buttonWidth !== 'auto' && { width: buttonWidth }),
  };

  // Create container styles - make container fit content
  const containerStyles = {
    display: 'block', // Make container fit content size
    ...(width && { '--button-width': width }),
    ...(buttonWidth !== 'auto' && { '--button-width': buttonWidth }),
  };

  if (buttonColor) {
    if (filled) {
      // Filled button with custom color
      buttonStyles.backgroundColor = buttonColor;
      buttonStyles.borderColor = buttonColor;
      // Use custom text color if provided, otherwise calculate contrast-based text color
      buttonStyles.color = textColor || getContrastTextColor(buttonColor);
    } else {
      // Outline button with custom color
      buttonStyles.backgroundColor = 'transparent';
      buttonStyles.borderColor = buttonColor;
      buttonStyles.color = textColor || buttonColor;
      // Set CSS variables for hover effect
      buttonStyles['--button-hover-color'] = buttonColor;
      buttonStyles['--button-hover-text-color'] =
        textColor || getContrastTextColor(buttonColor);
    }
  } else if (textColor) {
    // Apply text color even without button color
    buttonStyles.color = textColor;
  }

  // Apply border radius if provided
  if (borderRadius !== undefined) {
    buttonStyles.borderRadius = `${borderRadius}px`;
  }

  // Handle click prevention in edit mode
  const handleClick = (e) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Add hover effects through CSS classes and edit mode styling
  const buttonClasses = cx(
    'ui button',
    {
      'button-filled': filled,
      'button-outline': !filled,
      'button-custom-color': buttonColor,
      'button-edit-mode': isEditMode,
    },
    className,
  );

  // Add edit mode styles
  const finalButtonStyles = {
    ...buttonStyles,
    ...(isEditMode && {
      pointerEvents: 'none',
      cursor: 'default',
      opacity: 0.7,
    }),
  };

  // Get the resize configuration for button blocks (only in edit mode)
  const resizeConfig = isEditMode ? getResizeConfig('button') : null;
  // Render button content with icons
  const renderButtonContent = () => {
    return (
      <span className="button-content">
        {leftIcon && <i className={getIconClass(leftIcon)} />}
        <span className="button-text">{data.title || 'Button'}</span>
        {rightIcon && <i className={getIconClass(rightIcon)} />}
      </span>
    );
  };

  return (
    <MaybeWrap
      condition={!__SERVER__}
      as="div"
      className={cx('block __button', {
        [data.align]: data.align,
        'edit-mode': isEditMode,
      })}
      style={{
        ...containerStyles,
        position: 'relative', // Needed for resize handles positioning
      }}
    >
      <div
        className={cx('align', data.inneralign)}
        data-inner-align={data.inneralign}
      >
        {href && !isEditMode ? (
          isInternal ? (
            <Button
              as="a"
              href={href}
              className={buttonClasses}
              style={finalButtonStyles}
              data-filled={filled}
              data-custom-color={buttonColor}
            >
              {renderButtonContent()}
            </Button>
          ) : (
            <Button
              as="a"
              href={href}
              target={target}
              rel={rel}
              className={buttonClasses}
              style={finalButtonStyles}
              data-filled={filled}
              data-custom-color={buttonColor}
            >
              {renderButtonContent()}
            </Button>
          )
        ) : (
          <Button
            as="div"
            className={buttonClasses}
            style={finalButtonStyles}
            onClick={handleClick}
            data-filled={filled}
            data-custom-color={buttonColor}
          >
            {renderButtonContent()}
          </Button>
        )}
      </div>

      {/* Content resize handles - only in edit mode and when in grid */}
      {isEditMode && resizeConfig && selected && onChangeBlock && (
        <BlockResizeHandles
          data={data}
          onChangeBlock={onChangeBlock}
          block={block}
          selected={selected}
          config={resizeConfig}
          colors={{
            height: resizeConfig.height?.color || '#f39c12',
            width: resizeConfig.width?.color || '#9b59b6',
          }}
        />
      )}
    </MaybeWrap>
  );
};

export default View;
