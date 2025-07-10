// This is a wrapper function that takes a block's original schema enhancer
// and a custom styling configuration, and returns a new, enhanced schema enhancer.
export const withStylingConfiguration = (originalEnhancer, config) => {
  return ({ schema, formData, intl }) => {
    // First, run the original enhancer to get the base schema
    const originalSchema = originalEnhancer
      ? originalEnhancer({ schema, formData, intl })
      : schema;

    const blockType = formData['@type'];
    const blockConfig = config[blockType];

    if (blockConfig) {
      const { disabled = [], blockSpecific } = blockConfig;

      if (blockSpecific) {
        const { fieldset, fields } = blockSpecific;
        originalSchema.fieldsets.push({
          id: 'specificStyles',
          title: fieldset.title,
          fields: Object.keys(fields),
        });
        originalSchema.properties.specificStyles = {
          title: 'Specific Styles',
          widget: 'object',
          schema: {
            fieldsets: [
              { id: 'default', title: 'Default', fields: Object.keys(fields) },
            ],
            properties: fields,
          },
        };
      }

      // Disable generic styles by filtering the main styling fieldset
      const stylingFieldset =
        originalSchema.properties.styles.schema.fieldsets.find(
          (f) => f.id === 'styling',
        );
      if (stylingFieldset) {
        stylingFieldset.fields = stylingFieldset.fields.filter(
          (f) => !disabled.includes(f),
        );
      }
    }

    return originalSchema;
  };
};
