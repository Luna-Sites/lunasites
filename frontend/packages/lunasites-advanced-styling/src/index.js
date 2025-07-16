import React from 'react';
import { composeSchema } from '@plone/volto/helpers';
import { addAdvancedStyling } from './schemaEnhancer';
import { blockSpecificEnhancer, createBlockSpecificConfig, withBlockSpecificStyling } from './blockSpecificEnhancer';
import {
  BlockStyleWrapperEdit,
  BlockStyleWrapperView,
} from './BlockStyleWrapper';

import StyleSelectWidget from './Widgets/StyleSelect';
import AlignWidget from './Widgets/Align';
import StretchWidget from './Widgets/Stretch';
import TextAlignWidget from './Widgets/TextAlign';
import SliderWidget from './Widgets/Slider';
import SizeWidget from './Widgets/Size';
import SimpleColorPicker from './Widgets/SimpleColorPicker';
import QuadSizeWidget from './Widgets/QuadSize';
import HeadlineWidget from './Widgets/HeadlineWidget';

import './styles.less';

/**
 * Given a block's config object, it wraps the view and edit in style wrappers
 */
export const applyStyleWrapperToBlock = (blockConfig) => {
  const BaseEditComponent = blockConfig.edit;
  let EditComponent = BaseEditComponent;
  if (EditComponent && !EditComponent._styleWrapped) {
    EditComponent = (props) => (
      <BlockStyleWrapperEdit {...props}>
        <BaseEditComponent {...props} />
      </BlockStyleWrapperEdit>
    );
    EditComponent.displayName = `<EditBlockWithStyleWrapperFor(${blockConfig.id})>`;
    EditComponent._styleWrapped = true;
  }

  const BaseViewComponent = blockConfig.view;
  let ViewComponent = BaseViewComponent;
  if (ViewComponent && !ViewComponent._styleWrapped) {
    ViewComponent = (props) => (
      <BlockStyleWrapperView {...props}>
        <BaseViewComponent {...props} />
      </BlockStyleWrapperView>
    );
    ViewComponent.displayName = `<ViewBlockWithStyleWrapperFor(${blockConfig.id})>`;
    ViewComponent._styleWrapped = true;
  }
  return {
    ...blockConfig,
    view: ViewComponent,
    edit: EditComponent,
  };
};

const applyConfig = (config) => {
  const { settings } = config;

  // Configure which blocks can use advanced styling (same as original volto-block-style)
  const whitelist = settings.pluggableStylesBlocksWhitelist;
  const blacklist = settings.pluggableStylesBlocksBlacklist;
  const { blocksConfig } = config.blocks;

  // Apply advanced styling to eligible blocks
  const okBlocks = Object.keys(blocksConfig).filter(
    (name) =>
      (blacklist ? !blacklist.includes(name) : true) &&
      (whitelist ? whitelist.includes(name) : true),
  );

  okBlocks.forEach((name) => {
    // Apply style wrapper to each block (wraps edit and view components)
    blocksConfig[name] = applyStyleWrapperToBlock(blocksConfig[name]);

    // Apply the advanced styling schemaEnhancer to each block
    const existingEnhancer = blocksConfig[name].schemaEnhancer;
    blocksConfig[name] = {
      ...blocksConfig[name],
      schemaEnhancer: existingEnhancer
        ? composeSchema(existingEnhancer, addAdvancedStyling)
        : addAdvancedStyling,
    };
  });

  // Add blocks that natively integrate with block styling
  config.settings.integratesBlockStyles = [
    ...(config.settings.integratesBlockStyles || []),
    'text',
    'image',
    'video',
    'html',
    'table',
    'listing',
    'description',
    'title',
    'toc',
    'search',
    'maps',
    'teaser',
  ];

  // Register all styling widgets (same as original volto-block-style)
  config.widgets.widget.style_select = StyleSelectWidget;
  config.widgets.widget.style_align = AlignWidget;
  config.widgets.widget.style_stretch = StretchWidget;
  config.widgets.widget.style_text_align = TextAlignWidget;
  config.widgets.widget.style_size = SizeWidget;
  config.widgets.widget.style_simple_color = SimpleColorPicker;
  config.widgets.widget.slider = SliderWidget;
  config.widgets.widget.quad_size = QuadSizeWidget;
  config.widgets.widget.heading = HeadlineWidget;

  // Restrict block settings to Layout (same as original)
  if (config.settings.layoutOnlyBlockStyles === undefined) {
    config.settings.layoutOnlyBlockStyles = false;
  }

  // Set available colors (same as original volto-block-style)
  config.settings.available_colors = [
    '#bbdbec',
    '#9dc6d4',
    '#5a93aa',
    '#005d7b',
    '#003d53',
    '#ebefc6',
    '#bdd494',
    '#6bb535',
    '#1e8339',
    '#025e37',
    '#464b0b',
    '#b5c234',
    '#777b1a',
    '#f4f1bc',
    '#e1e070',
    '#0070ae',
    '#fce6dc',
    '#f39a86',
    '#e73d5c',
    '#b92f47',
    '#8e1206',
    '#fff6a6',
    '#ffe525',
    '#f7a600',
    '#b94b19',
    '#8d4107',
    '#000000',
    '#6f6f6e',
    '#929291',
    '#bcbcbc',
    '#e3e3e3',
    '#ffffff',
  ];

  return config;
};

export default applyConfig;

// Export block-specific enhancer functions and addAdvancedStyling
export { blockSpecificEnhancer, createBlockSpecificConfig, withBlockSpecificStyling };
export { addAdvancedStyling } from './schemaEnhancer';
export { BlockStyleWrapperEdit, BlockStyleWrapperView } from './BlockStyleWrapper';
export { StyleWrapperView } from './StyleWrapper';
export { getAdvancedStylingSchema } from './getAdvancedStylingSchema';
export { defaultStylingProperties } from './defaultStylingProperties';
export { getAdvancedStyling } from './getAdvancedStyling';

export const installDemoStyles = (config) => {
  config.settings.pluggableStyles = [
    ...(config.settings.pluggableStyles || []),
    {
      id: 'greenBox',
      title: 'Green box',
      cssClass: 'green-demo-box',
    },
    {
      id: 'blueShade',
      title: 'Blue Shade',
      cssClass: 'blue-demo-box',
      previewComponent: (props) => (
        <div className={`${props.className} preview-blue-demo-box`}>
          {props.children}
        </div>
      ),
      viewComponent: (props) => (
        <div className="blue-demo-box">{props.children}</div>
      ),
      // TODO: support also editComponent ?
    },
  ];

  return config;
};
