import React from 'react';
import cx from 'classnames';
import { ImageSidebar, SidebarPortal } from '@plone/volto/components';

import {
  flattenToAppURL,
  isInternalURL,
  withBlockExtensions,
} from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { ImageInput } from '@plone/volto/components/manage/Widgets/ImageWidget';
import Caption from '../../Caption/Caption';
import { BlockResizeHandles } from '../../CustomSectionBlock/BlockResizeHandler';
import { getResizeConfig } from '../../CustomSectionBlock/contentResizeConfig';

function Edit(props) {
  const { data, selected, block, onChangeBlock } = props;
  const Image = config.getComponent({ name: 'Image' }).component;
  
  // Apply image-specific resize properties
  const imageWidth = data.imageWidth && data.imageWidth !== 'auto' ? data.imageWidth : null;
  const imageHeight = data.imageHeight && data.imageHeight !== 'auto' ? data.imageHeight : null;
  
  // Get the resize configuration for image blocks (only in edit mode)
  const resizeConfig = getResizeConfig('image');
  const onSelectItem = React.useCallback(
    (url, item) => {
      const dataAdapter = props.blocksConfig[props.data['@type']].dataAdapter;
      dataAdapter({
        block: props.block,
        data: props.data,
        onChangeBlock: props.onChangeBlock,
        id: 'url',
        value: url,
        item,
      });
    },
    [props],
  );

  const handleChange = React.useCallback(
    async (id, image, { title, image_field, image_scales } = {}) => {
      const url = image ? image['@id'] || image : '';

      props.onChangeBlock(props.block, {
        ...props.data,
        url: flattenToAppURL(url),
        image_field,
        image_scales,
        alt: props.data.alt || title || '',
      });
    },
    [props],
  );

  return (
    <>
      <div
        className={cx(
          'block image align',
          {
            center: !Boolean(data.align),
            'edit-mode': true,
          },
          data.align,
        )}
        style={{
          position: 'relative', // Needed for resize handles positioning
          ...((imageWidth || imageHeight) && { display: 'inline-block' }), // Make container fit content when resized
        }}
      >
        {data.url ? (
          <figure
            className={cx(
              'figure',
              {
                center: !Boolean(data.align),
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
              display: 'inline-block', // Make figure fit image content
            }}
          >
            <Image
              className={cx({
                'image-custom-resize': imageWidth || imageHeight, // Custom class for resize override
              })}
              style={{
                ...(imageWidth && { width: imageWidth }),
                ...(imageHeight && { height: imageHeight }),
                ...(imageWidth || imageHeight ? { objectFit: 'cover' } : {}),
              }}
              // START CUSTOMIZATION - Moved to the figure
              // className={cx({
              //   'full-width': data.align === 'full',
              //   large: data.size === 'l',
              //   medium: data.size === 'm',
              //   small: data.size === 's',
              // })}
              // END CUSTOMIZATION
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
                          return `${flattenToAppURL(data.url)}/@@images/image`;
                        if (data.size === 'm')
                          return `${flattenToAppURL(
                            data.url,
                          )}/@@images/image/preview`;
                        if (data.size === 's')
                          return `${flattenToAppURL(data.url)}/@@images/image/mini`;
                        return `${flattenToAppURL(data.url)}/@@images/image`;
                      })()
                    : data.url
              }
              sizes={config.blocks.blocksConfig.image.getSizes(data)}
              alt={data.alt || ''}
              loading="lazy"
              responsive={true}
            />
            <Caption
              title={data.title}
              description={data.description}
              credit={data?.copyright_and_sources ?? data.credit?.data}
            />
          </figure>
        ) : (
          <ImageInput
            onChange={handleChange}
            placeholderLinkInput={data.placeholder}
            block={props.block}
            id={props.block}
            objectBrowserPickerType={'image'}
            onSelectItem={onSelectItem}
          />
        )}
        <SidebarPortal selected={props.selected}>
          <ImageSidebar {...props} />
        </SidebarPortal>
        
        {/* Content resize handles - only when selected and in grid */}
        {/* Dynamic CSS override for image width when resizing */}
        {imageWidth && (
          <style>
            {`.block.image.edit-mode .figure img.image-custom-resize { width: ${imageWidth} !important; }`}
          </style>
        )}
        
        {resizeConfig && selected && onChangeBlock && (
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
    </>
  );
}

export default withBlockExtensions(Edit);
