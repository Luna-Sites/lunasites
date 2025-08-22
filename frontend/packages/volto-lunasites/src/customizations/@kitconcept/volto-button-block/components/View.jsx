import React from 'react';
import { Button } from 'semantic-ui-react';
import { MaybeWrap } from '@plone/volto/components';
import { isInternalURL } from '@plone/volto/helpers';
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

const View = (props) => {
  const { data, isEditMode, className, style, selected, block, onChangeBlock } = props;

  const href = data.href?.[0];
  const isInternal = isInternalURL(href?.['@id'] || href) || !href;
  const target = data.openLinkInNewTab ? '_blank' : null;
  const rel = data.openLinkInNewTab ? 'noopener noreferrer' : null;

  // Apply block-specific styling from specificStyles (block-specific) not styles (general)
  const buttonColor = data.styles?.buttonColor;
  const filled = data.styles?.filled !== false; // Default to true if not specified
  const width = data.styles?.width;
  
  // Use container size if available (from our unified resize system)
  const containerSize = data.containerSize;
  
  // Calculate dynamic font size based on container size and text length
  let dynamicFontSize = data.fontSize || 16;
  let dynamicPadding = data.padding || 12;
  
  if (containerSize) {
    // Get text length to adjust font size accordingly
    const textLength = (data.title || 'Button').length;
    
    // Scale font size based on container dimensions
    // Use smaller of width/height ratios to ensure text fits
    const widthRatio = containerSize.width / 200; // Base width of 200px
    const heightRatio = containerSize.height / 50; // Base height of 50px
    const scaleRatio = Math.min(widthRatio, heightRatio);
    
    // Base font size scales between 10px and 32px
    let baseFontSize = Math.max(10, Math.min(32, 16 * scaleRatio));
    
    // Adjust font size based on text length
    // For longer text, reduce font size to help it fit better
    if (textLength > 20) {
      const lengthFactor = Math.max(0.7, 1 - (textLength - 20) * 0.01);
      baseFontSize = baseFontSize * lengthFactor;
    }
    
    dynamicFontSize = Math.max(10, baseFontSize);
    
    // Padding scales proportionally but less aggressively
    dynamicPadding = Math.max(4, Math.min(20, 12 * Math.sqrt(scaleRatio)));
  }
  
  const buttonWidth = data.buttonWidth || 'auto';
  
  // Check if we're in a grid layout (has grid properties)
  const isInGrid = data.gridColumn && data.columnSpan;
  
  // Create button styles based on block-specific configuration
  const buttonStyles = {
    ...style,
    fontSize: `${Math.round(dynamicFontSize)}px`,
    padding: `${Math.round(dynamicPadding)}px ${Math.round(dynamicPadding * 1.5)}px`,
    // In grid, don't set explicit dimensions - let CSS handle it
    // Otherwise use container size for freeform/linear layouts
    ...(!isInGrid && containerSize ? {
      width: `${containerSize.width}px`,
      height: `${containerSize.height}px`,
    } : {}),
    ...(buttonWidth !== 'auto' && !containerSize && !isInGrid && { width: buttonWidth }),
    // Ensure button fills container and centers text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    // Always allow text wrapping to fit within container
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    overflow: 'hidden', // Keep text within button bounds
    textAlign: 'center',
    lineHeight: 1.3,
    minWidth: '60px',
    minHeight: '30px',
    // Ensure text doesn't overflow container width
    maxWidth: '100%',
  };

  // Create container styles - make container fit content
  const containerStyles = {
    display: 'inline-block', // Make container fit content size
    ...(width && { '--button-width': width }),
    ...(buttonWidth !== 'auto' && { '--button-width': buttonWidth }),
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
        position: 'relative' // Needed for resize handles positioning
      }}
    >
      <div className={cx('align', data.inneralign)}>
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
              {data.title || 'Button'}
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
              {data.title || 'Button'}
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
            {data.title || 'Button'}
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
            width: resizeConfig.width?.color || '#9b59b6'
          }}
        />
      )}
    </MaybeWrap>
  );
};

export default View;
