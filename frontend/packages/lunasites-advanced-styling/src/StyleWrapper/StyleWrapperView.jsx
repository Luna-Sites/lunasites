import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { BodyClass } from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { withCachedImages } from '../hocs';
import { getFieldURL } from '../helpers';

const getLineHeight = (fontSize) => {
  switch (fontSize) {
    case 'large':
      return '110%';
    case 'x-large':
      return '130%';
    default:
      return;
  }
};

const getSide = (side, v) => {
  const v_unit = v.unit ? v.unit : 'px';
  return `${v[side] ? `${v[side]}${v_unit}` : '0px'}`;
};

const getSides = (v) => {
  return `${getSide('top', v)} ${getSide('right', v)} ${getSide(
    'bottom',
    v,
  )} ${getSide('left', v)}`;
};

const hexColorToRGB = (hex) => {
  const R = parseInt(hex.slice(1, 3), 16);
  const G = parseInt(hex.slice(3, 5), 16);
  const B = parseInt(hex.slice(5, 7), 16);
  return [R, G, B];
};

const h2rgb = (hex) => {
  if (!hex) return '0, 0, 0, ';
  const [R, G, B] = hexColorToRGB(hex);
  return `${R}, ${G}, ${B},`;
};

// Removed IsomorphicPortal - no portal needed

// Parse custom CSS string into object
function parseCustomCSS(cssString) {
  if (!cssString) return {};
  
  const styles = {};
  try {
    // Split by semicolon and process each property
    cssString.split(';').forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim());
      if (property && value) {
        // Convert kebab-case to camelCase for React
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        styles[camelProperty] = value;
      }
    });
  } catch (e) {
    console.warn('Error parsing custom CSS:', e);
  }
  
  return styles;
}

export function getInlineStyles(data, props = {}) {
  const customStyles = parseCustomCSS(data.customCSS);
  
  return {
    ...(data.hidden && props.mode !== 'edit' ? { display: 'none' } : {}),
    ...(data.backgroundColor
      ? {
          background: data.backgroundColor,
          '--background-color': data.backgroundColor,
        }
      : {}),
    ...(data.textColor
      ? { color: data.textColor, '--text-color': data.textColor }
      : {}),
    ...(data.textAlign ? { textAlign: data.textAlign } : {}),
    ...(data.fontSize
      ? { fontSize: data.fontSize, lineHeight: getLineHeight(data.fontSize) }
      : {}),
    ...(data.fontWeight ? { fontWeight: data.fontWeight } : {}),
    ...(data.height ? { height: data.height } : {}),
    ...(data.isScreenHeight && props.screen.height
      ? {
          minHeight: (
            props.screen.height -
            props.screen.browserToolbarHeight -
            props.screen.content.offsetTop
          ).toPixel(),
        }
      : {}),
    ...(data.shadowDepth && {
      boxShadow: `0px 0px ${data.shadowDepth}px rgba(${h2rgb(
        data.shadowColor,
      )} ${(data.shadowDepth * 100) / 0.24})`,
    }),
    ...(data.margin && { margin: getSides(data.margin) }),
    ...(data.padding && { padding: getSides(data.padding) }),
    ...(data.borderRadius && {
      borderRadius: data.borderRadius,
    }),
    ...(data.clear && {
      clear: data.clear,
    }),
    // Apply custom CSS styles (these can override defaults)
    ...customStyles,
  };
}

export function getStyle(name) {
  const { pluggableStyles = [] } = config.settings;
  return pluggableStyles.find(({ id }) => id === name);
}

const StyleWrapperView = (props) => {
  const { styleData = {}, data = {}, mode = 'view' } = props;

  // Debug logging

  const {
    style_name,
    align,
    size,
    customClass,
    theme,
    customId,
    isDropCap,
    isScreenHeight,
    useAsPageHeader = false,
    hidden = false,
    stretch,
  } = styleData;

  const containerType = data['@type'];
  const backgroundImage = getFieldURL(styleData.backgroundImage);

  const style = getStyle(style_name);
  const inlineStyles = getInlineStyles(styleData, props);
  const styled =
    props.styled ||
    Object.keys(inlineStyles).length > 0 ||
    backgroundImage ||
    style ||
    align ||
    size ||
    styleData.backgroundFullColor ||
    customClass ||
    theme ||
    isDropCap ||
    hidden ||
    customId ||
    stretch;

  const attrs = {
    style: inlineStyles,
    className: cx(
      `styled-${containerType}`,
      style?.cssClass,
      customClass,
      theme,
      align,
      props.className,
      // Add custom classes
      styleData.customClasses && styleData.customClasses.split(' ').filter(Boolean),
      {
        align,
        styled,
        'styled-with-bg': styleData.backgroundColor || backgroundImage,
        'styled-with-full-bg': styleData.backgroundFullColor,
        'screen-height': isScreenHeight,
        'full-width': align === 'full',
        stretch: stretch === 'stretch',
        large: size === 'l',
        medium: size === 'm',
        small: size === 's',
        'drop-cap': isDropCap,
        [`has--fontSize--${inlineStyles['fontSize']}`]:
          !!inlineStyles['fontSize'] && mode === 'edit',
      },
    ),
    id: customId,
    ...(props.role ? { role: props.role } : {}),
  };

  const nativeIntegration =
    config.settings.integratesBlockStyles.includes(containerType);

  const children = nativeIntegration
    ? Object.keys(styleData).length > 0
      ? React.Children.map(props.children, (child) => {
          const childProps = { ...props, styling: attrs };
          if (React.isValidElement(child)) {
            return React.cloneElement(child, childProps);
          }
          return child;
        })
      : props.children
    : props.children;

  const ViewComponentWrapper = style?.viewComponent;
  const StyleWrapperRendered = styled ? (
    nativeIntegration &&
    !style_name?.includes('content-box') &&
    mode !== 'edit' ? (
      children
    ) : (
      <div>
        <div {...attrs} ref={props.setRef}>
          {styleData.backgroundFullColor && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw',
                height: '100%',
                background: styleData.backgroundFullColor,
                zIndex: -1,
              }}
            />
          )}
          {Object.keys(props.images || {}).map((bgImage) => (
            <img
              key={`styled-bg-image-${bgImage}`}
              alt=""
              src={props.images[bgImage]?.src}
              className={cx('bg', {
                hidden:
                  backgroundImage !== bgImage || !props.images[bgImage]?.src,
              })}
            />
          ))}

          {ViewComponentWrapper ? (
            <ViewComponentWrapper {...props} />
          ) : (
            children
          )}
        </div>
      </div>
    )
  ) : ViewComponentWrapper ? (
    <ViewComponentWrapper {...props} />
  ) : (
    children
  );

  return useAsPageHeader ? (
    <React.Fragment>
      <BodyClass className="custom-page-header" />
      {StyleWrapperRendered}
    </React.Fragment>
  ) : (
    StyleWrapperRendered
  );
};

export default connect((state, ownProps) =>
  ownProps.styleData.isScreenHeight ? { screen: state.screen } : {},
)(
  withCachedImages(StyleWrapperView, {
    getImage: (props) => props.styleData.backgroundImage || null,
  }),
);
