/**
 * Content Resize Configuration
 *
 * This file manages which block types support content resizing within the grid layout.
 * Content resize allows users to modify block content properties (font size, padding, dimensions)
 * instead of just changing the grid container size.
 */

// Default block types that support content resizing
export const DEFAULT_CONTENT_RESIZABLE_BLOCKS = ['button'];

// Configuration for different content resize properties
export const RESIZE_PROPERTY_CONFIGS = {
  button: {
    height: {
      property: 'padding',
      defaultValue: 12,
      min: 4,
      max: 40,
      step: 8,
      directions: ['s', 'n'], // vertical edges only
      color: '#f39c12', // Orange
      title: 'Resize button height',
    },
    width: {
      property: 'buttonWidth',
      defaultValue: 'auto',
      min: 80,
      max: 400,
      step: 1,
      directions: ['e', 'w'], // horizontal edges only
      color: '#9b59b6', // Purple
      title: 'Resize button width',
    },
  },
};

/**
 * Register a new block type as content-resizable
 * @param {string} blockType - The block type (e.g., 'text', 'image')
 * @param {object} config - Configuration for resize properties
 */
export const registerContentResizableBlock = (blockType, config) => {
  if (!DEFAULT_CONTENT_RESIZABLE_BLOCKS.includes(blockType)) {
    DEFAULT_CONTENT_RESIZABLE_BLOCKS.push(blockType);
  }
  RESIZE_PROPERTY_CONFIGS[blockType] = config;
};

/**
 * Check if a block type supports content resizing
 * @param {string} blockType - The block type to check
 * @returns {boolean}
 */
export const isContentResizable = (blockType) => {
  return DEFAULT_CONTENT_RESIZABLE_BLOCKS.includes(blockType);
};

/**
 * Get resize configuration for a block type
 * @param {string} blockType - The block type
 * @returns {object|null} - Resize configuration or null if not supported
 */
export const getResizeConfig = (blockType) => {
  return RESIZE_PROPERTY_CONFIGS[blockType] || null;
};

/**
 * Example: Adding a new block type with content resize support
 *
 * registerContentResizableBlock('text', {
 *   fontSize: {
 *     property: 'fontSize',
 *     defaultValue: 14,
 *     min: 8,
 *     max: 48,
 *     step: 2,
 *     directions: ['se', 'ne', 'sw', 'nw'],
 *     color: '#e74c3c',
 *     title: 'Resize text font size'
 *   },
 *   lineHeight: {
 *     property: 'lineHeight',
 *     defaultValue: 1.4,
 *     min: 1.0,
 *     max: 3.0,
 *     step: 0.1,
 *     directions: ['s', 'n'],
 *     color: '#f39c12',
 *     title: 'Resize line height'
 *   }
 * });
 */
