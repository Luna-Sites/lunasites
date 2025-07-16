import { defineMessages } from 'react-intl';
import { addStyling } from '@plone/volto/helpers/Extensions/withBlockSchemaEnhancer';
import config from '@plone/volto/registry';

const messages = defineMessages({
  styling: {
    id: 'Styling',
    defaultMessage: 'Styling',
  },
  text: {
    id: 'fieldsets-text',
    defaultMessage: 'Text',
  },
  advanced: {
    id: 'advanced',
    defaultMessage: 'Advanced',
  },
  background: {
    id: 'fieldsets-background',
    defaultMessage: 'Background',
  },
  default: {
    id: 'fieldsets-default',
    defaultMessage: 'Default',
  },
  presets: {
    id: 'fieldsets-presets',
    defaultMessage: 'Preset styles',
  },
  standard: {
    id: 'fieldsets-standard',
    defaultMessage: 'Standard',
  },
  decorations: {
    id: 'fieldsets-decorations',
    defaultMessage: 'Decorations',
  },
  layout: {
    id: 'fieldsets-layout',
    defaultMessage: 'Layout',
  },
  advanced: {
    id: 'fieldsets-advanced',
    defaultMessage: 'Advanced',
  },
  pThemeTitle: {
    id: 'properties-theme-title',
    defaultMessage: 'Theme',
  },
  pThemeDescription: {
    id: 'properties-theme-description',
    defaultMessage: 'A predefined theme, applicable just to this block',
  },
  pStyleName: {
    id: 'properties-style-name',
    defaultMessage: 'Style',
  },
  pTextAlign: {
    id: 'properties-text-align',
    defaultMessage: 'Text align',
  },
  pAlign: {
    id: 'properties-align',
    defaultMessage: 'Align',
  },
  pStretch: {
    id: 'properties-stretch',
    defaultMessage: 'Stretch',
  },
  pFontSizeTitle: {
    id: 'properties-font-size-title',
    defaultMessage: 'Font size',
  },
  pFontSizeDescription: {
    id: 'properties-font-size-description',
    defaultMessage: 'Relative to normal size of text in the block',
  },
  pFontWeightTitle: {
    id: 'properties-font-weight-title',
    defaultMessage: 'Font weight',
  },
  pFontWeightDescription: {
    id: 'properties-font-weight-description',
    defaultMessage: 'The weight (or boldness) of the font',
  },
  pMargin: {
    id: 'properties-margin',
    defaultMessage: 'Margin',
  },
  pPadding: {
    id: 'properties-padding',
    defaultMessage: 'Padding',
  },
  pSize: {
    id: 'properties-size',
    defaultMessage: 'Box size',
  },
  pHeightTitle: {
    id: 'properties-height-title',
    defaultMessage: 'Element height',
  },
  pHeightDescription: {
    id: 'properties-height-description',
    defaultMessage: 'Element height, expressed as CSS dimension',
  },
  pIsScreenHeightTitle: {
    id: 'properties-is-screen-height-title',
    defaultMessage: 'Screen height',
  },
  pIsScreenHeightDescription: {
    id: 'properties-is-screen-height-description',
    defaultMessage: 'Maximize block to viewport height',
  },
  pBackgroundImage: {
    id: 'properties-background-image',
    defaultMessage: 'Background image',
  },
  pBackgroundColor: {
    id: 'properties-background-color',
    defaultMessage: 'Background color',
  },
  pBackgroundFullColor: {
    id: 'properties-background-full-color',
    defaultMessage: 'Background section',
  },
  pTextColor: {
    id: 'properties-text-color',
    defaultMessage: 'Text color',
  },
  pCustomClassTitle: {
    id: 'properties-custom-class-title',
    defaultMessage: 'Custom CSS Class',
  },
  pCustomClassDescription: {
    id: 'properties-custom-class-description',
    defaultMessage: 'A custom CSS class, applicable just to this block',
  },
  pCustomIdTitle: {
    id: 'properties-custom-id-title',
    defaultMessage: 'Custom Id',
  },
  pCustomIdDescription: {
    id: 'properties-custom-id-description',
    defaultMessage: 'A custom id, applicable just to this block',
  },
  pIsDropCapTitle: {
    id: 'properties-is-drop-cap-title',
    defaultMessage: 'Drop cap',
  },
  pIsDropCapDescription: {
    id: 'properties-is-drop-cap-description',
    defaultMessage: 'First letter is styled as a drop cop',
  },
  pHiddenTitle: {
    id: 'properties-hidden-title',
    defaultMessage: 'Hidden',
  },
  pHiddenDescription: {
    id: 'properties-hidden-description',
    defaultMessage: 'Hide this bloc',
  },
  pShadowDepth: {
    id: 'properties-shadow-depth',
    defaultMessage: 'Shadow depth',
  },
  pShadowColor: {
    id: 'properties-shadow-color',
    defaultMessage: 'Shadow color',
  },
  pBorderRadius: {
    id: 'properties-border-radius',
    defaultMessage: 'Rounded Corner',
  },
  pClearTitle: {
    id: 'properties-clear-title',
    defaultMessage: 'Clear floats',
  },
  pClearDescription: {
    id: 'properties-clear-description',
    defaultMessage: 'Pushes selected block under floated content',
  },
  // Specific styles messages
  filled: {
    id: 'filled',
    defaultMessage: 'Filled',
  },
  width: {
    id: 'width',
    defaultMessage: 'Width',
  },
  buttonColor: {
    id: 'buttonColor',
    defaultMessage: 'Button Color',
  },
  blockSpecific: {
    id: 'blockSpecific',
    defaultMessage: 'Block Specific',
  },
});

/**
 * Original volto-block-style schema recreated for Volto's native sidebar
 * Maintains the exact same functionality but integrated into sidebar instead of popup
 */

import { getAdvancedStylingSchema } from './getAdvancedStylingSchema';

export const addAdvancedStyling = ({ schema, formData, intl }) => {
  // First add the base styling fieldset
  addStyling({ schema, formData, intl });

  const advancedStylingSchema = getAdvancedStylingSchema(intl);

  // Add all styling properties to the styles schema
  schema.properties.styles.schema.properties = {
    ...schema.properties.styles.schema.properties,
    ...advancedStylingSchema.properties,
  };

  // Organize styling options in single vertical fieldset
  const stylingFieldset = {
    id: 'styling',
    title: 'Styling',
    fields: [
      'text',
      'textAlign',
      'fontSize',
      // 'fontWeight',
      'textColor',
      // 'isDropCap',
      'background',
      'backgroundImage',
      'backgroundColor',
      'backgroundFullColor',

      'borderRadius',
      'shadowDepth',
      'shadowColor',
      'layout',
      'align',
      'stretch',
      'size',
      'margin',
      'padding',
      'height',
      'isScreenHeight',
      'advanced',
      'clear',
      'useAsPageHeader',
      'style_name',
      'theme',
      'hidden',
      'customClass',
      'customId',
      'customClasses',
      'customCSS',
    ],
  };

  if (schema.disabledStyling) {
    stylingFieldset.fields = stylingFieldset.fields.filter(
      (f) => !schema.disabledStyling.includes(f),
    );
  }

  if (schema.specificStyling) {
    const { messages, fieldset, fields } = schema.specificStyling;
    const intl = schema.specificStyling.intl;

    // Translate titles
    fieldset.title = intl.formatMessage(messages.blockSpecific);
    for (const field in fields) {
      fields[field].title = intl.formatMessage(messages[field]);
    }

    schema.fieldsets.push({
      id: 'specificStyles',
      title: fieldset.title,
      fields: Object.keys(fields),
    });
    schema.properties.specificStyles = {
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

  schema.properties.styles.schema.fieldsets = [stylingFieldset];

  return schema;
};
