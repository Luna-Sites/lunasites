/**
 * Example configuration for button block specific styling
 */

import { createBlockSpecificConfig, withBlockSpecificStyling } from '../blockSpecificEnhancer';
import { addAdvancedStyling } from '../schemaEnhancer';

// Button block specific configuration
const buttonBlockConfig = createBlockSpecificConfig({
  'button': {
    // Disable some default styling options for button blocks
    disabled: ['backgroundImage', 'shadowDepth', 'shadowColor', 'isDropCap'],
    // Add button-specific styling options
    specificStyles: {
      title: 'Button Options',
      fields: {
        buttonColor: {
          title: 'Button Color',
          type: 'color',
          widget: 'style_simple_color',
          // Uses the same available colors as other styling options
        },
        filled: {
          title: 'Filled',
          type: 'boolean',
          description: 'Filled button or outline only',
        },
      },
    },
  },
});

// Export the enhancer for button block
export const buttonBlockEnhancer = withBlockSpecificStyling(
  addAdvancedStyling,
  buttonBlockConfig
);

export default buttonBlockConfig;