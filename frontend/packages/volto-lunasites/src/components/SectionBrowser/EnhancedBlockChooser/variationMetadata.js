// Enhanced Block Chooser - Simplified Variation Metadata
// Contains basic metadata for block variations

export const VARIATION_CATEGORIES = {
  LAYOUT: 'layout',
  STYLE: 'style',
  FUNCTIONALITY: 'functionality',
  CONTENT: 'content',
};

export const VARIATION_ICONS = {
  // Layout variations
  LIST: 'LIST',
  GRID: 'GRID',
  TABLE: 'TABLE',
  GALLERY: 'GALLERY',
  CAROUSEL: 'CAROUSEL',
  ACCORDION: 'ACCORDION',
  TABS: 'TABS',
  MASONRY: 'MASONRY',

  // Style variations
  CARD: 'CARD',
  MINIMAL: 'MINIMAL',
  MODERN: 'MODERN',
  CLASSIC: 'CLASSIC',
  COLORFUL: 'COLORFUL',
  DARK: 'DARK',
  LIGHT: 'LIGHT',

  // Functionality variations
  INTERACTIVE: 'INTERACTIVE',
  STATIC: 'STATIC',
  FILTERABLE: 'FILTERABLE',
  SORTABLE: 'SORTABLE',
  SEARCHABLE: 'SEARCHABLE',
  PAGINATED: 'PAGINATED',
  INFINITE_SCROLL: 'INFINITE',

  // Content variations
  RICH_MEDIA: 'MEDIA',
  TEXT_FOCUSED: 'TEXT',
  IMAGE_HEAVY: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
};

// Simplified variation metadata
export const VARIATION_METADATA = {
  // Text Block Variations
  slate: {
    default: {
      icon: VARIATION_ICONS.TEXT_FOCUSED,
      title: 'Standard Text',
      description: 'Clean, simple text editor with basic formatting options',
      previewImage: '/static/block-previews/slate-default.png',
    },
  },

  // Listing Block Variations
  listing: {
    default: {
      icon: VARIATION_ICONS.LIST,
      title: 'Simple List',
      description: 'Basic vertical list layout with title and description',
      previewImage: '/static/block-previews/listing-default.png',
    },
    summary: {
      icon: VARIATION_ICONS.LIST,
      title: 'Summary View',
      description: 'Compact list with thumbnails and brief descriptions',
      previewImage: '/static/block-previews/listing-summary.png',
    },
    imageOnTop: {
      icon: VARIATION_ICONS.GALLERY,
      title: 'Image First',
      description: 'Visual-focused layout with large images above content',
      previewImage: '/static/block-previews/listing-image-top.png',
    },
    imageOnLeft: {
      icon: VARIATION_ICONS.CARD,
      title: 'Side-by-Side',
      description: 'Horizontal layout with image on left, content on right',
      previewImage: '/static/block-previews/listing-image-left.png',
    },
    imageOnRight: {
      icon: VARIATION_ICONS.CARD,
      title: 'Reverse Layout',
      description: 'Horizontal layout with content on left, image on right',
      previewImage: '/static/block-previews/listing-image-right.png',
    },
  },

  // Grid Block Variations
  gridBlock: {
    default: {
      icon: VARIATION_ICONS.GRID,
      title: 'Standard Grid',
      description: 'Flexible grid layout with customizable columns and rows',
      previewImage: '/static/block-previews/grid-default.png',
    },
  },

  // Table Block Variations
  table: {
    default: {
      icon: VARIATION_ICONS.TABLE,
      title: 'Basic Table',
      description: 'Simple data table with rows and columns',
      previewImage: '/static/block-previews/table-default.png',
    },
    fancy: {
      icon: VARIATION_ICONS.COLORFUL,
      title: 'Enhanced Table',
      description: 'Styled table with striped rows, hover effects, and enhanced visuals',
      previewImage: '/static/block-previews/table-fancy.png',
    },
  },

  // Image Block Variations
  image: {
    default: {
      icon: VARIATION_ICONS.IMAGE_HEAVY,
      title: 'Standard Image',
      description: 'Simple image display with optional caption and alt text',
      previewImage: '/static/block-previews/image-default.png',
    },
  },

  // Video Block Variations
  video: {
    default: {
      icon: VARIATION_ICONS.VIDEO,
      title: 'Embedded Video',
      description: 'Responsive video player with basic controls',
      previewImage: '/static/block-previews/video-default.png',
    },
  },
};

// Helper function to get variation metadata
export const getVariationMetadata = (blockId, variationId = 'default') => {
  return VARIATION_METADATA[blockId]?.[variationId] || {
    icon: 'BLOCK',
    title: 'Standard',
    description: 'Standard block variation',
  };
};

// Helper function to get all variations for a block
export const getBlockVariations = (blockId) => {
  return VARIATION_METADATA[blockId] || {};
};

// Helper function to get variation icon
export const getVariationIcon = (metadata) => {
  return metadata.icon || 'BLOCK';
};