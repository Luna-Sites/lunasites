// ... rest of the file
import { cloneDeep } from 'lodash';
import { defineMessages } from 'react-intl';

import { composeSchema, getPreviousNextBlock } from '@plone/volto/helpers';
import {
  defaultStylingSchema,
  removeStylingSchema,
} from './components/Blocks/schema';
import { teaserSchemaEnhancer } from './components/Blocks/Teaser/schema';
import { videoBlockSchemaEnhancer } from './components/Blocks/Video/schema';
import { gridTeaserDisableStylingSchema } from '@plone/volto/components/manage/Blocks/Teaser/schema';
import { gridImageDisableSizeAndPositionHandlersSchema } from '@plone/volto/components/manage/Blocks/Image/schema';
import { disableBgColorSchema } from './components/Blocks/disableBgColorSchema';
import BlockSettingsSchema from '@plone/volto/components/manage/Blocks/Block/Schema';

import ContainerQueriesPolyfill from './components/CQPolyfill';
import AppExtras from './components/AppExtras/AppExtras';
import { Container } from '@plone/components';
import TopSideFacets from './components/Blocks/Search/TopSideFacets';

import GridListingBlockTemplate from './components/Blocks/Listing/GridTemplate';
import { ButtonStylingSchema } from './components/Blocks/Button/schema';
import {
  withBlockSpecificStyling,
  addAdvancedStyling,
} from 'lunasites-advanced-styling';

import { Editor, Transforms, Text } from 'slate';
import alignLeftIcon from '@plone/volto/icons/align-left.svg';
import alignRightIcon from '@plone/volto/icons/align-right.svg';
import alignCenterIcon from '@plone/volto/icons/align-center.svg';
import alignJustifyIcon from '@plone/volto/icons/align-justify.svg';

import {
  MarkElementButton,
  ToolbarButton,
  BlockButton,
} from '@plone/volto-slate/editor/ui';

import { useSlate } from 'slate-react';
import { useCallback } from 'react';
import { imageBlockSchemaEnhancer } from './components/Blocks/Image/schema';
import { ImageBlockDataAdapter } from './components/Blocks/Image/adapter';

import { AccordionSchemaEnhancer } from './components/Blocks/Accordion/schema';

import { searchBlockSchemaEnhancer } from './components/Blocks/Search/schema';

import gridSVG from './icons/block_icn_grid.svg';
import accordionSVG from './icons/block_icn_accordion.svg';
import descriptionSVG from '@plone/volto/icons/description.svg';
import EventView from './components/Theme/EventView';
import { tocBlockSchemaEnhancer } from './components/Blocks/Toc/schema';
import { mapsBlockSchemaEnhancer } from './components/Blocks/Maps/schema';
import { sliderBlockSchemaEnhancer } from './components/Blocks/Slider/schema';

import EventMetadataView from './components/Blocks/EventMetadata/View';

// Color Schema System
import { ColorSchemaProvider, ColorSchemaField } from './components';
import { colorSchemaInherit } from './reducers';

const isBlockClassActive = (editor, format) => {
  if (!editor.selection) return false;
  // TODO: someone fix this
  const levels = Array.from(Editor.levels(editor, editor.selection));
  if (levels.length < 2) return false;
  const [, [node]] = levels;
  return node.styleName === format;
};
const toggleBlockClassFormat = (editor, format) => {
  const levels = Array.from(Editor.levels(editor, editor.selection));
  // TODO: someone fix this
  if (levels.length < 2) return false;
  const [, [, path]] = levels;
  Transforms.setNodes(
    editor,
    { styleName: format },
    {
      at: path,
    },
  );
  return;
};
function BlockClassButton({ format, icon, ...props }) {
  const editor = useSlate();

  const isActive = isBlockClassActive(editor, format);

  const handleMouseDown = useCallback(
    (event) => {
      event.preventDefault();
      toggleBlockClassFormat(editor, format);
    },
    [editor, format], // , isActive
  );

  return (
    <ToolbarButton
      {...props}
      active={isActive}
      onMouseDown={handleMouseDown}
      icon={icon}
    />
  );
}

const BG_COLORS = [
  { name: 'transparent', label: 'Transparent' },
  { name: 'grey', label: 'Grey' },
];

defineMessages({
  Press: {
    id: 'Press',
    defaultMessage: 'Press',
  },
  Sitemap: {
    id: 'Sitemap',
    defaultMessage: 'Sitemap',
  },
});

const applyConfig = (config) => {
  // Add color schema reducers
  config.addonReducers = {
    ...config.addonReducers,
    colorSchemaInherit,
  };

  // Register color schema widget
  config.widgets.widget.color_schema = ColorSchemaField;

  config.blocks.blocksConfig.title.restricted = false;
  config.settings.enableAutoBlockGroupingByBackgroundColor = true;
  config.settings.navDepth = 3;
  config.settings.enableFatMenu = true;
  config.settings.slate.useLinkedHeadings = false;
  config.settings.contentMetadataTagsImageField = 'preview_image';

  // Block-specific styling configurations
  const blockSpecificConfigs = {
    // Button block with disabled styles and specific options
    __button: {
      disabled: ['textAlign', 'align', 'size'],
      specificStyles: {
        title: 'Button Options',
        fields: {
          buttonColor: {
            title: 'Button Color',
            type: 'color',
            widget: 'style_simple_color',
          },
          filled: {
            title: 'Filled',
            type: 'boolean',
            description: 'Filled button or outline only',
          },
        },
      },
    },
  };

  // Initial block for event content type
  config.blocks.initialBlocks.Event = [
    { '@type': 'title' },
    { '@type': 'eventMetadata', fixed: true, required: true },
    { '@type': 'slate' },
  ];

  config.settings.siteLabel = '';
  config.settings.intranetHeader = false;

  // Register our custom Container component
  config.registerComponent({
    name: 'Container',
    component: Container,
  });

  // Register custom StyleWrapper ClassNames
  config.settings.styleClassNameExtenders = [
    ({ block, content, data, classNames }) => {
      let styles = [];
      const [previousBlock, nextBlock] = getPreviousNextBlock({
        content,
        block,
      });

      // Inject a class depending of which type is the next block
      if (nextBlock?.['@type']) {
        styles.push(`next--is--${nextBlock['@type']}`);
      }

      // Inject a class depending if previous is the same type of block
      if (data?.['@type'] === previousBlock?.['@type']) {
        styles.push('previous--is--same--block-type');
      }

      // Inject a class depending if next is the same type of block
      if (data?.['@type'] === nextBlock?.['@type']) {
        styles.push('next--is--same--block-type');
      }

      // Inject a class depending if it's the first of block type
      if (data?.['@type'] !== previousBlock?.['@type']) {
        styles.push('is--first--of--block-type');
      }

      // Inject a class depending if it's the last of block type
      if (data?.['@type'] !== nextBlock?.['@type']) {
        styles.push('is--last--of--block-type');
      }

      // Inject a class depending if it has a headline
      if (data?.headline || previousBlock?.['@type'] === 'heading') {
        styles.push('has--headline');
      }

      // Given a StyleWrapper defined `backgroundColor` style
      const previousColor =
        previousBlock?.styles?.backgroundColor ?? 'transparent';
      const currentColor = data?.styles?.backgroundColor ?? 'transparent';
      const nextColor = nextBlock?.styles?.backgroundColor ?? 'transparent';

      // Inject a class depending if the previous block has the same `backgroundColor`
      if (currentColor === previousColor) {
        styles.push('previous--has--same--backgroundColor');
      } else if (currentColor !== previousColor) {
        styles.push('previous--has--different--backgroundColor');
      }

      // Inject a class depending if the next block has the same `backgroundColor`
      if (currentColor === nextColor) {
        styles.push('next--has--same--backgroundColor');
      } else if (currentColor !== nextColor) {
        styles.push('next--has--different--backgroundColor');
      }

      return [...classNames, ...styles];
    },
  ];

  config.settings.slidingSearchAnimation = true;
  config.settings.openExternalLinkInNewTab = true;

  config.blocks.blocksConfig.__button = {
    ...config.blocks.blocksConfig.__button,
    schemaEnhancer: withBlockSpecificStyling(addAdvancedStyling, {
      __button: blockSpecificConfigs['__button'],
    }),
    colors: BG_COLORS,
  };
  config.settings.appExtras = [
    ...config.settings.appExtras,
    {
      match: '',
      component: AppExtras,
    },
    {
      match: '',
      component: ColorSchemaProvider,
    },
  ];

  config.blocks.blocksConfig.accordion = {
    ...config.blocks.blocksConfig.accordion,
    mostUsed: true,
    icon: accordionSVG,
    allowedBlocks: [
      'slate',
      'teaser',
      'image',
      'listing',
      'slateTable',
      'separator',
    ],
    colors: BG_COLORS,
    schemaEnhancer: composeSchema(AccordionSchemaEnhancer, addAdvancedStyling),
    sidebarTab: 1,
  };

  config.blocks.blocksConfig.slateTable = {
    ...config.blocks.blocksConfig.slateTable,
    schemaEnhancer: addAdvancedStyling,
    colors: BG_COLORS,
  };

  config.blocks.blocksConfig.listing = {
    ...config.blocks.blocksConfig.listing,
    colors: BG_COLORS,
    schemaEnhancer: addAdvancedStyling,
    allowed_headline_tags: [['h2', 'h2']],
    variations: [
      ...config.blocks.blocksConfig.listing.variations,
      {
        id: 'grid',
        title: 'Grid',
        template: GridListingBlockTemplate,
      },
    ],
  };

  config.blocks.blocksConfig.image = {
    ...config.blocks.blocksConfig.image,
    schemaEnhancer: imageBlockSchemaEnhancer,
    dataAdapter: ImageBlockDataAdapter,
  };

  // Accordion internal `blocksConfig` amendments
  // We cloneDeep the blocksConfig to avoid modifying the original object
  // in subsequent modifications of the accordion block config
  config.blocks.blocksConfig.accordion.blocksConfig = cloneDeep(
    config.blocks.blocksConfig,
  );

  config.blocks.blocksConfig.accordion.blocksConfig.teaser.schemaEnhancer =
    composeSchema(teaserSchemaEnhancer, disableBgColorSchema);

  config.blocks.blocksConfig.gridBlock.colors = BG_COLORS;
  config.blocks.blocksConfig.gridBlock.schemaEnhancer = defaultStylingSchema;
  config.blocks.blocksConfig.gridBlock.icon = gridSVG;

  // Grids internal `blocksConfig` amendments
  // Slate in grids must have an extra wrapper with the `slate` className
  const OriginalSlateBlockView = config.blocks.blocksConfig.slate.view;
  config.blocks.blocksConfig.gridBlock.blocksConfig.slate.view = (props) => {
    return (
      <div className="slate">
        <OriginalSlateBlockView {...props} />
      </div>
    );
  };

  config.blocks.blocksConfig.gridBlock.blocksConfig.image.schemaEnhancer =
    composeSchema(
      imageBlockSchemaEnhancer,
      gridImageDisableSizeAndPositionHandlersSchema,
    );
  config.blocks.blocksConfig.gridBlock.blocksConfig.image.dataAdapter =
    ImageBlockDataAdapter;

  config.blocks.blocksConfig.gridBlock.blocksConfig.teaser.schemaEnhancer =
    composeSchema(gridTeaserDisableStylingSchema, teaserSchemaEnhancer);

  config.blocks.blocksConfig.gridBlock.blocksConfig.listing.allowed_headline_tags =
    [['h2', 'h2']];
  config.blocks.blocksConfig.gridBlock.blocksConfig.listingschemaEnhancer =
    removeStylingSchema;
  config.blocks.blocksConfig.gridBlock.blocksConfig.listingvariations = [];

  config.blocks.blocksConfig.introduction = {
    ...config.blocks.blocksConfig.introduction,
    unwantedButtons: ['heading-three', 'blockquote'],
  };
  config.blocks.blocksConfig.title.restricted = false;
  config.blocks.blocksConfig.gridBlock.allowedBlocks = [
    'image',
    'listing',
    'slate',
    'teaser',
    'video',
  ];
  config.blocks.requiredBlocks = [];

  config.blocks.blocksConfig.slate = {
    ...config.blocks.blocksConfig.slate,
    colors: BG_COLORS,
    schemaEnhancer: addAdvancedStyling,
    sidebarTab: 1,
  };

  config.blocks.blocksConfig.teaser = {
    ...config.blocks.blocksConfig.teaser,
    group: 'teasers',
    imageScale: 'larger',
    colors: BG_COLORS,
    schemaEnhancer: composeSchema(addAdvancedStyling, teaserSchemaEnhancer),
  };

  config.blocks.blocksConfig.video = {
    ...config.blocks.blocksConfig.video,
    colors: BG_COLORS,
    schemaEnhancer: composeSchema(
      defaultStylingSchema,
      videoBlockSchemaEnhancer,
    ),
  };
  config.blocks.blocksConfig.maps = {
    ...config.blocks.blocksConfig.maps,
    colors: BG_COLORS,
    schemaEnhancer: composeSchema(
      defaultStylingSchema,
      mapsBlockSchemaEnhancer,
    ),
  };

  config.blocks.blocksConfig.heading = {
    ...config.blocks.blocksConfig.heading,
    sidebarTab: 0,
    allowed_headings: [['h2', 'h2']],
    colors: BG_COLORS,
    schemaEnhancer: addAdvancedStyling,
  };

  config.blocks.blocksConfig.search = {
    ...config.blocks.blocksConfig.search,
    schemaEnhancer: searchBlockSchemaEnhancer,
    variations: [
      {
        id: 'facetsTopSide',
        title: 'Facets on top',
        view: TopSideFacets,
        isDefault: true,
      },
    ],
  };

  config.blocks.blocksConfig.eventMetadata = {
    id: 'eventMetadata',
    title: 'EventMetadata',
    icon: descriptionSVG,
    group: 'common',
    view: EventMetadataView,
    edit: EventMetadataView,
    schema: BlockSettingsSchema,
    restricted: ({ properties, block }) =>
      properties['@type'] === 'Event' ? false : true,
    mostUsed: false,
    sidebarTab: 0,
  };

  // Check if the separator is present before enhancing it
  if (config.blocks.blocksConfig?.separator?.id) {
    config.blocks.blocksConfig.separator = {
      ...config.blocks.blocksConfig.separator,
      schemaEnhancer: composeSchema(
        config.blocks.blocksConfig.separator.schemaEnhancer,
        addAdvancedStyling,
      ),
      colors: BG_COLORS,
    };
  }

  config.views.contentTypesViews.Event = EventView;

  // Text Align buttons

  // Align left
  if (!config.settings.slate.toolbarButtons.includes('text-left')) {
    config.settings.slate.buttons['text-left'] = (props) => (
      <BlockClassButton
        format="text-left"
        icon={alignLeftIcon}
        title="Align left"
        {...props}
      />
    );

    config.settings.slate.toolbarButtons = [
      ...config.settings.slate.toolbarButtons,
      'separator',
      'text-left',
    ];

    config.settings.slate.expandedToolbarButtons = [
      ...config.settings.slate.expandedToolbarButtons,
      'separator',
      'text-left',
    ];
  }

  // Align center
  if (!config.settings.slate.toolbarButtons.includes('text-center')) {
    config.settings.slate.buttons['text-center'] = (props) => (
      <BlockClassButton
        format="text-center"
        icon={alignCenterIcon}
        title="Align center"
        {...props}
      />
    );

    config.settings.slate.toolbarButtons = [
      ...config.settings.slate.toolbarButtons,
      'text-center',
    ];

    config.settings.slate.expandedToolbarButtons = [
      ...config.settings.slate.expandedToolbarButtons,
      'text-center',
    ];
  }

  // Align right
  if (!config.settings.slate.toolbarButtons.includes('text-right')) {
    config.settings.slate.buttons['text-right'] = (props) => (
      <BlockClassButton
        format="text-right"
        icon={alignRightIcon}
        title="Align right"
        {...props}
      />
    );

    config.settings.slate.toolbarButtons = [
      ...config.settings.slate.toolbarButtons,
      'text-right',
    ];

    config.settings.slate.expandedToolbarButtons = [
      ...config.settings.slate.expandedToolbarButtons,
      'text-right',
    ];
  }

  // Align justify
  if (!config.settings.slate.toolbarButtons.includes('text-justify')) {
    config.settings.slate.buttons['text-justify'] = (props) => (
      <BlockClassButton
        format="text-justify"
        icon={alignJustifyIcon}
        title="Align justify"
        {...props}
      />
    );

    config.settings.slate.toolbarButtons = [
      ...config.settings.slate.toolbarButtons,
      'text-justify',
      'separator',
    ];

    config.settings.slate.expandedToolbarButtons = [
      ...config.settings.slate.expandedToolbarButtons,
      'text-justify',
      'separator',
    ];
  }

  // Clear formatting
  if (!config.settings.slate.toolbarButtons.includes('clearformatting')) {
    config.settings.slate.toolbarButtons = [
      ...config.settings.slate.toolbarButtons,
      'clearformatting',
    ];
  }

  // TOC Block
  config.blocks.blocksConfig.toc = {
    ...config.blocks.blocksConfig.toc,
    schemaEnhancer: composeSchema(addAdvancedStyling, tocBlockSchemaEnhancer),
    // remove horizontal variation
    variations: [config.blocks.blocksConfig.toc.variations[0]],
  };

  // Slider Block
  config.blocks.blocksConfig.slider = {
    ...config.blocks.blocksConfig.slider,
    schemaEnhancer: sliderBlockSchemaEnhancer,
  };

  // Columns Block
  config.blocks.blocksConfig.columnsBlock = {
    ...config.blocks.blocksConfig.columnsBlock,
    schemaEnhancer: addAdvancedStyling,
    colors: BG_COLORS,
  };

  return config;
};

export const withContainerQueryPolyfill = (config) => {
  config.settings.appExtras = [
    ...config.settings.appExtras,
    {
      match: '',
      component: ContainerQueriesPolyfill,
    },
  ];

  return config;
};

export default applyConfig;
