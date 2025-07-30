export function AccordionSchemaEnhancer({ schema, formData, intl }) {
  // Opinionated removal of the options fieldset (if it exists)
  if (schema.fieldsets) {
    schema.fieldsets = schema.fieldsets.filter((item) => item.id !== 'options');
  }

  // Some other opinionated defaults - only set if properties exist
  schema.required = [];

  // Check if properties exist before setting defaults (for backwards compatibility)
  if (schema.properties?.right_arrows) {
    schema.properties.right_arrows.default = true;
  }
  if (schema.properties?.collapsed) {
    schema.properties.collapsed.default = false;
  }
  if (schema.properties?.non_exclusive) {
    schema.properties.non_exclusive.default = false;
  }

  return schema;
}
