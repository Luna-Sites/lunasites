import { defineMessages } from 'react-intl';
import { v4 as uuid } from 'uuid';

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
  // Panel content
  panelTitle: {
    id: 'Panel title',
    defaultMessage: 'Panel title',
  },
  // Accordion theme
  accordionTheme: {
    id: 'Accordion Theme',
    defaultMessage: 'Accordion Theme',
  },
});

// Individual accordion panel schema (similar to heroSlideSchema in luna-super-hero)
export const accordionPanelSchema = (intl) => {
  return {
    title: 'Accordion Panel',
    fieldsets: [
      {
        id: 'default',
        title: intl.formatMessage(messages.default),
        fields: ['panel_title'],
      },
    ],
    properties: {
      // Panel content
      panel_title: {
        title: intl.formatMessage(messages.panelTitle),
        type: 'string',
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
        fields: ['panels', 'accordion_theme'],
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
          },
          {
            '@id': uuid(),
            panel_title: 'Panel 2',
          },
          {
            '@id': uuid(),
            panel_title: 'Panel 3',
          },
        ],
      },
      // Accordion theme variation
      accordion_theme: {
        title: intl.formatMessage(messages.accordionTheme),
        widget: 'accordion_variation',
        default: 'primary_accordion',
      },
    },
    required: [],
  };
};

// Legacy schema for compatibility (if needed)
export const AccordionSchema = (intl) => accordionPanelSchema(intl);
