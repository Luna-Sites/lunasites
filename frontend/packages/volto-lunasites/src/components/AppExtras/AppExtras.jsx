import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { getLunaTheming } from '../../actions';

const AppExtras = (props) => {
  const { content, lunaTheming, dispatch } = props;
  
  const viewClass = content?.view
    ? `view-${content?.view?.token?.toLowerCase() || ''}`
    : '';

  // Load Luna Theming on mount
  React.useEffect(() => {
    if (!lunaTheming?.get?.loaded && !lunaTheming?.get?.loading) {
      dispatch(getLunaTheming());
    }
  }, [dispatch, lunaTheming]);

  // Apply CSS variables when theming data changes
  React.useEffect(() => {
    if (lunaTheming?.data) {
      applyCSSVariables(lunaTheming.data);
    }
  }, [lunaTheming?.data]);

  const applyCSSVariables = (themingData) => {
    const root = document.documentElement;

    // Apply colors
    if (themingData.colors) {
      const colors = themingData.colors;
      
      // Main colors
      root.style.setProperty('--lunasites-background-color', colors.background_color || '#ffffff');
      root.style.setProperty('--lunasites-neutral-color', colors.neutral_color || '#222222');
      root.style.setProperty('--lunasites-primary-color', colors.primary_color || '#094ce1');
      root.style.setProperty('--lunasites-secondary-color', colors.secondary_color || '#e73d5c');
      root.style.setProperty('--lunasites-tertiary-color', colors.tertiary_color || '#6bb535');
      
      // Legacy mappings for backward compatibility
      root.style.setProperty('--lunasites-text-color', colors.neutral_color || '#222222');
      
      // Header colors - combinations of background and primary
      root.style.setProperty('--lunasites-header-bg-color', colors.background_color || '#ffffff');
      root.style.setProperty('--lunasites-header-text-color', colors.primary_color || '#094ce1');
      
      // Dropdown colors
      root.style.setProperty('--lunasites-dropdown-color', colors.background_color || '#ffffff');
      root.style.setProperty('--lunasites-dropdown-font-color', colors.neutral_color || '#222222');

      // Generate derived colors
      try {
        // Primary variants
        root.style.setProperty(
          '--lunasites-primary-light',
          `color-mix(in srgb, ${colors.primary_color || '#094ce1'} 80%, white)`,
        );
        root.style.setProperty(
          '--lunasites-primary-dark',
          `color-mix(in srgb, ${colors.primary_color || '#094ce1'} 80%, black)`,
        );
        
        // Secondary variants
        root.style.setProperty(
          '--lunasites-secondary-light',
          `color-mix(in srgb, ${colors.secondary_color || '#e73d5c'} 80%, white)`,
        );
        root.style.setProperty(
          '--lunasites-secondary-dark',
          `color-mix(in srgb, ${colors.secondary_color || '#e73d5c'} 80%, black)`,
        );
      } catch (e) {
        // Fallback for browsers without color-mix support
        root.style.setProperty('--lunasites-primary-light', colors.primary_color || '#094ce1');
        root.style.setProperty('--lunasites-primary-dark', colors.primary_color || '#094ce1');
        root.style.setProperty('--lunasites-secondary-light', colors.secondary_color || '#e73d5c');
        root.style.setProperty('--lunasites-secondary-dark', colors.secondary_color || '#e73d5c');
      }
    }

    // Apply fonts
    if (themingData.fonts) {
      const fonts = themingData.fonts;
      
      if (fonts.primary_font) {
        root.style.setProperty('--lunasites-primary-font', fonts.primary_font);
      }
      if (fonts.secondary_font) {
        root.style.setProperty('--lunasites-secondary-font', fonts.secondary_font);
      }
      
      if (fonts.font_sizes) {
        Object.entries(fonts.font_sizes).forEach(([size, value]) => {
          root.style.setProperty(`--lunasites-font-size-${size}`, value);
        });
      }
    }

    // Apply button styles
    if (themingData.buttons) {
      const buttons = themingData.buttons;
      
      Object.entries(buttons).forEach(([prop, value]) => {
        root.style.setProperty(`--lunasites-button-${prop.replace(/_/g, '-')}`, value);
      });
    }

    // Trigger event for other components
    window.dispatchEvent(
      new CustomEvent('lunaThemingApplied', {
        detail: { themingData },
      }),
    );
  };

  return viewClass ? <BodyClass className={viewClass} /> : null;
};

export default compose(
  injectLazyLibs(['reactDnd']),
  connect((state) => ({
    content: state.content.data,
    lunaTheming: state.lunaTheming,
  })),
)(AppExtras);
