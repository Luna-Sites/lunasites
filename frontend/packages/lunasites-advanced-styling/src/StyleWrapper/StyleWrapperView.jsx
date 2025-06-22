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

export function getInlineStyles(data, props = {}) {
  return {
    ...(data.hidden && props.mode !== 'edit' ? { display: 'none' } : {}),
    ...(data.backgroundColor
      ? {
          backgroundColor: data.backgroundColor,
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
    // fill in more
  };
}

export function getStyle(name) {
  const { pluggableStyles = [] } = config.settings;
  return pluggableStyles.find(({ id }) => id === name);
}

const StyleWrapperView = (props) => {
  const { styleData = {}, data = {}, mode = 'view' } = props;

  // Debug logging
  if (mode === 'edit') {
    console.log('StyleWrapperView edit mode - styleData:', styleData);
    console.log('StyleWrapperView edit mode - data:', data);
    console.log('StyleWrapperView edit mode - props:', props);
  }
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
    customClass ||
    theme ||
    isDropCap ||
    hidden ||
    customId ||
    stretch;

  // Debug styling calculation
  if (mode === 'edit') {
    console.log('StyleWrapperView - inlineStyles:', inlineStyles);
    console.log('StyleWrapperView - styled:', styled);
    console.log('StyleWrapperView - style:', style);
  }

  const attrs = {
    style: inlineStyles,
    className: cx(
      `styled-${containerType}`,
      style?.cssClass,
      customClass,
      theme,
      align,
      props.className,
      {
        align,
        styled,
        'styled-with-bg': styleData.backgroundColor || backgroundImage,
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
      <div {...attrs} ref={props.setRef}>
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

        {ViewComponentWrapper ? <ViewComponentWrapper {...props} /> : children}
      </div>
    )
  ) : ViewComponentWrapper ? (
    <ViewComponentWrapper {...props} />
  ) : (
    children
  );

  // Debug final render decision
  if (mode === 'edit') {
    console.log('StyleWrapperView - nativeIntegration:', nativeIntegration);
    console.log('StyleWrapperView - containerType:', containerType);
    console.log('StyleWrapperView - attrs:', attrs);
    console.log(
      'StyleWrapperView - will render wrapper div:',
      styled &&
        !(
          nativeIntegration &&
          !style_name?.includes('content-box') &&
          mode !== 'edit'
        ),
    );
  }

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
