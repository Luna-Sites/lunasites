import { addAdvancedStyling } from './schemaEnhancer';

const applyConfig = (config) => {
  config.settings.schemaEnhancers = [
    ...(config.settings.schemaEnhancers || []),
    addAdvancedStyling,
  ];
  return config;
};

export default applyConfig;