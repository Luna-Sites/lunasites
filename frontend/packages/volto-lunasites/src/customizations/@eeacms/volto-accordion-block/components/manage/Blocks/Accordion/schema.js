import { defineMessages } from 'react-intl';
import config from '@plone/volto/registry';
import { v4 as uuid } from 'uuid';
import { getAdvancedStyling } from 'lunasites-advanced-styling';

const messages = defineMessages({
  accordion: {
    id: 'Accordion',
    defaultMessage: 'Accordion',
  },
  default: {
    id: 'Default',
    defaultMessage: 'Default',
  },
  panels: {
    id: 'Accordion Panels',
    defaultMessage: 'Accordion Panels',
  },
  panelStyling: {
    id: 'Panel Styling',
    defaultMessage: 'Panel Styling',
  },
  // Panel content
  panelTitle: {
    id: 'Panel title',
    defaultMessage: 'Panel title',
  },
  // Panel styling
  panelTitleColor: {
    id: 'Panel title color',
    defaultMessage: 'Title color',
  },
});

// Individual accordion panel schema (similar to heroSlideSchema in luna-super-hero)
export const accordionPanelSchema = (intl) => {
  const advancedStyling = getAdvancedStyling(intl);

  return {
    title: 'Accordion Panel',
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.default),
        fields: ['panel_title'],
      },
      {
        id: 'styling',
        title: intl.formatMessage(messages.panelStyling),
        fields: [...advancedStyling.fields, 'panel_titleColor'],
      },
    ],
    properties: {
      // Panel content
      panel_title: {
        title: intl.formatMessage(messages.panelTitle),
        type: 'string',
      },
      ...advancedStyling.properties,
      panel_titleColor: {
        title: intl.formatMessage(messages.panelTitleColor),
        type: 'color',
        widget: 'style_simple_color',
        available_colors: config.settings.available_colors,
      },
    },
    required: [],
  };
};

// Main accordion block schema (similar to HeroBlockSchema in luna-super-hero)
export const AccordionBlockSchema = (props) => {
  const { intl, activeObject, setActiveObject } = props;

  return {
    title: intl.formatMessage(messages.accordion),
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.default),
        fields: ['panels'],
      },
    ],
    properties: {
      // Panels using object_list widget (similar to slides in luna-super-hero)
      panels: {
        widget: 'object_list',
        title: intl.formatMessage(messages.panels),
        schema: accordionPanelSchema(intl),
        activeObject: activeObject,
        setActiveObject: setActiveObject,
        default: [
          {
            '@id': uuid(),
            panel_title: 'Panel 1',
            panel_backgroundColor: null,
            panel_textColor: null,
            panel_titleColor: null,
            panel_border: false,
          },
          {
            '@id': uuid(),
            panel_title: 'Panel 2',
            panel_backgroundColor: null,
            panel_textColor: null,
            panel_titleColor: null,
            panel_border: false,
          },
          {
            '@id': uuid(),
            panel_title: 'Panel 3',
            panel_backgroundColor: null,
            panel_textColor: null,
            panel_titleColor: null,
            panel_border: false,
          },
        ],
      },
    },
    required: [],
  };
};

// Legacy schema for compatibility (if needed)
export const AccordionSchema = (intl) => accordionPanelSchema(intl);
