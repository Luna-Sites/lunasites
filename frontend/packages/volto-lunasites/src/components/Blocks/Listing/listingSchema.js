export const listingSchemaEnhancer = ({ schema, formData, intl }) => {
  // Remove headline field from listing blocks
  if (schema.fieldsets[0]?.fields) {
    schema.fieldsets[0].fields = schema.fieldsets[0].fields.filter(
      (field) => field !== 'headline',
    );
  }

  // Remove headline property
  if (schema.properties.headline) {
    delete schema.properties.headline;
  }

  // Add Card Settings fieldset
  schema.fieldsets.push({
    id: 'card_settings',
    title: 'Card Settings',
    fields: [
      'showTitle',
      'showDescription',
      'showDate',
      'showAuthor',
      'titleLength',
      'descriptionLength',
      'imageAspectRatio',
      'cardStyle',
      ...(formData.cardStyle === 'default' ? ['filled'] : []),
      ...(formData.variation === 'grid' ? ['maxNumberOfColumns'] : []),
    ],
  });

  // Add card settings properties
  schema.properties.showTitle = {
    title: 'Show Title',
    type: 'boolean',
    default: true,
  };

  schema.properties.showDescription = {
    title: 'Show Description',
    type: 'boolean',
    default: true,
  };

  schema.properties.showDate = {
    title: 'Show Date',
    type: 'boolean',
    default: false,
  };

  schema.properties.showAuthor = {
    title: 'Show Author',
    type: 'boolean',
    default: false,
  };

  schema.properties.titleLength = {
    title: 'Title Max Length',
    type: 'number',
    default: 50,
    minimum: 10,
    maximum: 200,
  };

  schema.properties.descriptionLength = {
    title: 'Description Max Length',
    type: 'number',
    default: 100,
    minimum: 20,
    maximum: 500,
  };

  schema.properties.imageAspectRatio = {
    title: 'Image Aspect Ratio',
    type: 'string',
    choices: [
      ['4:3', 'Standard (4:3)'],
      ['1:1', 'Square (1:1)'],
      ['16:9', 'Wide (16:9)'],
      ['3:4', 'Portrait (3:4)'],
      ...(formData.variation !== 'grid' ? [['auto', 'Auto']] : []),
    ],
    default: '16:9',
  };

  schema.properties.cardStyle = {
    title: 'Card Style',
    type: 'string',
    choices: [
      ['default', 'Default - All info visible'],
      ['overlay', 'Overlay - Info on hover'],
    ],
    default: 'default',
  };

  schema.properties.maxNumberOfColumns = {
    title: 'Max Number of Columns',
    type: 'number',
    default: 3,
    minimum: 1,
    maximum: 6,
  };

  schema.properties.filled = {
    title: 'Filled Background',
    type: 'boolean',
    default: true,
    description: 'Use colored background or transparent (no paper effect)',
  };

  return schema;
};
