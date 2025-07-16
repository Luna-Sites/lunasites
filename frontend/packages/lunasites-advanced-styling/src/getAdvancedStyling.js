import { getAdvancedStylingSchema } from './getAdvancedStylingSchema';
import { defaultStylingProperties } from './defaultStylingProperties';

export const getAdvancedStyling = (intl) => {
  const schema = getAdvancedStylingSchema(intl);
  const properties = defaultStylingProperties(intl);
  
  return {
    fields: schema.fieldsets[0].fields,
    properties: properties,
  };
};