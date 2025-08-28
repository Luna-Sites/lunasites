import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { getLunaTheming } from '../../actions';

const AppExtras = (props) => {
  const { content, lunaTheming, dispatch, pathname } = props;

  const viewClass = content?.view
    ? `view-${content?.view?.token?.toLowerCase() || ''}`
    : '';

  // Load Luna Theming data on mount and when path changes
  React.useEffect(() => {
    dispatch(getLunaTheming());
  }, [dispatch, pathname]);

  // Apply CSS variables whenever theming data changes in Redux
  React.useEffect(() => {
    console.log(lunaTheming);
    if (lunaTheming?.data?.colors) {
      console.log('appling');
      applyCSSVariables(lunaTheming.data.colors);
    }
  }, [lunaTheming?.data]);

  const applyCSSVariables = (colors) => {
    const root = document.documentElement;

    console.log('AppExtras: Applying CSS variables from registry:', colors);

    // Apply colors - only the main 5 colors from color palette
    if (colors) {
      console.log({ colors });

      // Main colors from registry
      root.style.setProperty(
        '--lunasites-background-color',
        colors.background_color || '#ffffff',
      );
      root.style.setProperty(
        '--lunasites-neutral-color',
        colors.neutral_color || '#222222',
      );
      root.style.setProperty(
        '--lunasites-primary-color',
        colors.primary_color || '#094ce1',
      );
      root.style.setProperty(
        '--lunasites-secondary-color',
        colors.secondary_color || '#e73d5c',
      );
      root.style.setProperty(
        '--lunasites-tertiary-color',
        colors.tertiary_color || '#6bb535',
      );

      // Legacy mappings for backward compatibility
      root.style.setProperty(
        '--lunasites-text-color',
        colors.neutral_color || '#222222',
      );
      root.style.setProperty(
        '--lunasites-accent-color',
        colors.tertiary_color || '#6bb535',
      );
      root.style.setProperty(
        '--lunasites-header-color',
        colors.primary_color || '#094ce1',
      );
      root.style.setProperty(
        '--lunasites-header-bg-color',
        colors.background_color || '#ffffff',
      );
      root.style.setProperty(
        '--lunasites-header-text-color',
        colors.primary_color || '#094ce1',
      );

      // Generate derived colors with fallback
      try {
        root.style.setProperty(
          '--lunasites-primary-light',
          `color-mix(in srgb, ${colors.primary_color || '#094ce1'} 80%, white)`,
        );
        root.style.setProperty(
          '--lunasites-primary-dark',
          `color-mix(in srgb, ${colors.primary_color || '#094ce1'} 80%, black)`,
        );
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
        root.style.setProperty(
          '--lunasites-primary-light',
          colors.primary_color || '#5a9cfc',
        );
        root.style.setProperty(
          '--lunasites-primary-dark',
          colors.primary_color || '#073bb3',
        );
        root.style.setProperty(
          '--lunasites-secondary-light',
          colors.secondary_color || '#f56d8a',
        );
        root.style.setProperty(
          '--lunasites-secondary-dark',
          colors.secondary_color || '#d2253e',
        );
      }
    }

    // Apply links styling - use tertiary color
    root.style.setProperty(
      '--lunasites-link-color',
      colors.tertiary_color || '#6bb535',
    );
  };

  return viewClass ? <BodyClass className={viewClass} /> : null;
};

export default compose(
  injectLazyLibs(['reactDnd']),
  connect((state) => ({
    content: state.content.data,
    lunaTheming: state.lunaTheming,
    pathname: state.router?.location?.pathname,
  })),
)(AppExtras);
