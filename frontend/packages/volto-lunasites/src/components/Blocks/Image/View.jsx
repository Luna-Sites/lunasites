/**
 * View image block.
 * @module components/manage/Blocks/Image/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { UniversalLink } from '@plone/volto/components';
import cx from 'classnames';
import Caption from '../../Caption/Caption';
import {
  flattenToAppURL,
  isInternalURL,
  withBlockExtensions,
} from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { BlockResizeHandles } from '../../CustomSectionBlock/BlockResizeHandler';
import { getResizeConfig } from '../../CustomSectionBlock/contentResizeConfig';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
export const ImageView = ({ className, data, detached, properties, style, isEditMode, selected, block, onChangeBlock }) => {
  let href;
  if (data.href?.length > 0) {
    if (typeof data.href === 'object') {
      href = data.href[0]['@id'];
    } else if (typeof data.href === 'string') {
      // just to catch cases where a string might be supplied
      href = data.href;
    }
  }

  const Image = config.getComponent({ name: 'Image' }).component;
  const shouldRenderCaption =
    data.title ||
    data.description ||
    (data?.copyright_and_sources ?? data.credit?.data);

  // Apply image-specific resize properties
  const imageWidth = data.imageWidth && data.imageWidth !== 'auto' ? data.imageWidth : null;
  const imageHeight = data.imageHeight && data.imageHeight !== 'auto' ? data.imageHeight : null;
  
  // Get the resize configuration for image blocks (only in edit mode)
  const resizeConfig = isEditMode ? getResizeConfig('image') : null;

  return (
    <div
      className={cx(
        'block image align',
        {
          center: !Boolean(data.align),
          detached,
          'edit-mode': isEditMode,
        },
        data.align,
        className,
      )}
      style={{
        ...style,
        position: 'relative', // Needed for resize handles positioning
      }}
    >
      {data.url && (
        <>
          {(() => {
            const image = (
              <figure
                className={cx(
                  'figure',
                  {
                    center: !Boolean(data.align),
                    detached,
                  },
                  data.align,
                  {
                    // START CUSTOMIZATION
                    // 'full-width': data.align === 'full',
                    // END CUSTOMIZATION
                    large: data.size === 'l',
                    medium: data.size === 'm' || !data.size,
                    small: data.size === 's',
                  },
                )}
                style={{
                  display: 'inline-block', // Make figure fit content
                }}
              >
                <Image
                  // Removed for now
                  // className={cx({
                  //   'full-width': data.align === 'full',
                  //   large: data.size === 'l',
                  //   medium: data.size === 'm',
                  //   small: data.size === 's',
                  // })}
                  style={{
                    ...(imageWidth && { width: imageWidth }),
                    ...(imageHeight && { height: imageHeight }),
                    ...(imageWidth || imageHeight ? { objectFit: 'cover' } : {}), // Only apply objectFit when resizing
                  }}
                  item={
                    data.image_scales
                      ? {
                          '@id': data.url,
                          image_field: data.image_field,
                          image_scales: data.image_scales,
                        }
                      : undefined
                  }
                  src={
                    data.image_scales
                      ? undefined
                      : isInternalURL(data.url)
                        ? // Backwards compat in the case that the block is storing the full server URL
                          (() => {
                            if (data.size === 'l')
                              return `${flattenToAppURL(
                                data.url,
                              )}/@@images/image`;
                            if (data.size === 'm')
                              return `${flattenToAppURL(
                                data.url,
                              )}/@@images/image/preview`;
                            if (data.size === 's')
                              return `${flattenToAppURL(
                                data.url,
                              )}/@@images/image/mini`;
                            return `${flattenToAppURL(data.url)}/@@images/image`;
                          })()
                        : data.url
                  }
                  sizes={config.blocks.blocksConfig.image.getSizes(data)}
                  alt={data.alt || ''}
                  loading="lazy"
                  responsive={true}
                />
                {shouldRenderCaption && (
                  <Caption
                    title={data.title}
                    description={data.description}
                    credit={data?.copyright_and_sources ?? data.credit?.data}
                  />
                )}
              </figure>
            );
            if (href) {
              return (
                <UniversalLink
                  href={href}
                  openLinkInNewTab={data.openLinkInNewTab}
                >
                  {image}
                </UniversalLink>
              );
            } else {
              return image;
            }
          })()}
        </>
      )}
      
      {/* Content resize handles - only in edit mode and when selected */}
      {isEditMode && resizeConfig && selected && onChangeBlock && (
        <BlockResizeHandles
          data={data}
          onChangeBlock={onChangeBlock}
          block={block}
          selected={selected}
          config={resizeConfig}
          colors={{
            width: resizeConfig.width?.color || '#3498db',
            height: resizeConfig.height?.color || '#27ae60'
          }}
        />
      )}
    </div>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
ImageView.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  className: PropTypes.string,
  detached: PropTypes.bool,
  properties: PropTypes.object,
  style: PropTypes.object,
  isEditMode: PropTypes.bool,
  selected: PropTypes.bool,
  block: PropTypes.string,
  onChangeBlock: PropTypes.func,
};

export default withBlockExtensions(ImageView);
