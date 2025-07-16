import { defineMessages } from 'react-intl';

const messages = defineMessages({
  blockSpecific: {
    id: 'blockSpecific',
    defaultMessage: 'Block Specific',
  },
});

/**
 * Enhanced block-specific enhancer that provides block-specific styling capabilities.
 * Works on top of the existing schemaEnhancer and allows:
 * - Disabling specific default styling fields per block type
 * - Adding block-specific styling fields inline (like in schemaEnhancer)
 */
export const blockSpecificEnhancer = (config) => {
  return ({ schema, formData, intl }) => {
    const blockType = formData['@type'];
    const blockConfig = config[blockType];

    if (!blockConfig) {
      return schema;
    }

    const { disabled = [], specificStyles = {} } = blockConfig;

    // Disable specific styling fields for this block type
    if (disabled.length > 0) {
      const stylingFieldset = schema.properties.styles?.schema?.fieldsets?.find(
        (f) => f.id === 'styling',
      );
      
      if (stylingFieldset) {
        stylingFieldset.fields = stylingFieldset.fields.filter(
          (field) => !disabled.includes(field),
        );
      }
    }

    // Add block-specific styling fields inline (like schemaEnhancer approach)
    if (Object.keys(specificStyles).length > 0) {
      const { title = intl.formatMessage(messages.blockSpecific), fields = {} } = specificStyles;
      
      // Add block-specific title widget
      const blockSpecificTitleField = `${blockType}SpecificTitle`;
      schema.properties.styles.schema.properties[blockSpecificTitleField] = {
        title: title,
        widget: 'heading',
      };

      // Add all block-specific fields to schema properties
      Object.keys(fields).forEach(fieldName => {
        schema.properties.styles.schema.properties[fieldName] = {
          ...fields[fieldName],
        };
      });

      // Add fields to the styling fieldset (inline approach) - at the beginning
      const stylingFieldset = schema.properties.styles?.schema?.fieldsets?.find(
        (f) => f.id === 'styling',
      );
      
      if (stylingFieldset) {
        // Add title delimiter and specific fields to the beginning of the fieldset
        stylingFieldset.fields.unshift(
          blockSpecificTitleField,
          ...Object.keys(fields)
        );
      }
    }

    return schema;
  };
};

/**
 * Factory function to create block-specific configurations
 * Usage example:
 * 
 * const config = createBlockSpecificConfig({
 *   'text': {
 *     disabled: ['backgroundImage', 'shadowDepth'],
 *     specificStyles: {
 *       title: 'Text Options',
 *       fields: {
 *         letterSpacing: {
 *           title: 'Letter Spacing',
 *           widget: 'text',
 *           description: 'Space between letters'
 *         },
 *         lineHeight: {
 *           title: 'Line Height',
 *           widget: 'slider',
 *           settings: { min: 1, max: 3, step: 0.1 }
 *         }
 *       }
 *     }
 *   }
 * });
 */
export const createBlockSpecificConfig = (config) => {
  return config;
};

/**
 * Helper function to compose the blockSpecificEnhancer with the main schemaEnhancer
 */
export const withBlockSpecificStyling = (originalEnhancer, blockConfig) => {
  const enhancer = blockSpecificEnhancer(blockConfig);
  
  return ({ schema, formData, intl }) => {
    // First apply the original enhancer (usually addAdvancedStyling)
    const baseSchema = originalEnhancer
      ? originalEnhancer({ schema, formData, intl })
      : schema;
    
    // Then apply the block-specific configuration
    return enhancer({ schema: baseSchema, formData, intl });
  };
};