export const paginationSchemaEnhancer = ({ schema, formData, intl }) => {
  const hasPagination = formData?.enablePagination;

  schema.properties.enablePagination = {
    title: 'Enable Pagination',
    type: 'boolean',
    default: false,
  };

  if (hasPagination) {
    schema.properties.b_size = {
      title: 'Items per page',
      type: 'number',
      default: 10,
      minimum: 1,
      maximum: 100,
    };
  }

  schema.fieldsets[0].fields.push('enablePagination');

  if (hasPagination) {
    schema.fieldsets[0].fields.push('b_size');
  }

  return schema;
};
