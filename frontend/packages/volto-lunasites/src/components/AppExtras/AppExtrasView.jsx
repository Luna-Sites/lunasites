import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { connect, useSelector } from 'react-redux';
import { compose } from 'redux';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { getLunaTheming } from '../../actions';

const AppExtrasView = (props) => {
  const { content, dispatch, pathname } = props;
  const lunaTheming = useSelector((state) => state.lunaTheming);

  const viewClass = content?.view
    ? `view-${content?.view?.token?.toLowerCase() || ''}`
    : '';

  // Load Luna Theming data on mount and when path changes
  React.useEffect(() => {
    dispatch(getLunaTheming());
  }, [dispatch, pathname]);

  // Apply CSS variables whenever theming data changes in Redux
  React.useEffect(() => {
    if (lunaTheming?.data) {
      applyCSSVariables(lunaTheming.data);
    }
  }, [lunaTheming?.data]);

  const applyCSSVariables = (theme) => {
    const colors = theme.colors;
    const headerVariation = theme.header;
    const containerWidth = theme.container_width;
    const root = document.documentElement;

    // Apply colors - only the main 5 colors from color palette
    if (colors) {
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

    // Apply header variations from registry
    applyHeaderVariation(
      headerVariation?.variation || 'primary_navigation',
      colors,
    );
    // Apply container width for view mode
    applyContainerWidth(containerWidth || 'normal');
  };

  const applyHeaderVariation = (variation, colors) => {
    const root = document.documentElement;
    switch (variation) {
      case 'primary_navigation':
        root.style.setProperty(
          '--lunasites-header-bg-color',
          colors.primary_color || '#094ce1',
        );
        root.style.setProperty(
          '--lunasites-header-text-color',
          colors.tertiary_color || '#6bb535',
        );
        root.style.setProperty(
          '--lunasites-dropdown-color',
          colors.neutral_color || '#222222',
        );
        root.style.setProperty(
          '--lunasites-dropdown-font-color',
          colors.tertiary_color || '#6bb535',
        );
        break;

      case 'neutral_navigation':
        root.style.setProperty(
          '--lunasites-header-bg-color',
          colors.neutral_color || '#222222',
        );
        root.style.setProperty(
          '--lunasites-header-text-color',
          colors.tertiary_color || '#6bb535',
        );
        root.style.setProperty(
          '--lunasites-dropdown-color',
          colors.background_color || '#ffffff',
        );
        root.style.setProperty(
          '--lunasites-dropdown-font-color',
          colors.neutral_color || '#222222',
        );
        break;

      case 'light_background_navigation':
        root.style.setProperty(
          '--lunasites-header-bg-color',
          colors.background_color || '#ffffff',
        );
        root.style.setProperty(
          '--lunasites-header-text-color',
          colors.neutral_color || '#222222',
        );
        root.style.setProperty(
          '--lunasites-dropdown-color',
          colors.tertiary_color || '#6bb535',
        );
        root.style.setProperty(
          '--lunasites-dropdown-font-color',
          colors.neutral_color || '#222222',
        );
        break;

      case 'secondary_accent_navigation':
        root.style.setProperty(
          '--lunasites-header-bg-color',
          colors.secondary_color || '#e73d5c',
        );
        root.style.setProperty(
          '--lunasites-header-text-color',
          colors.tertiary_color || '#6bb535',
        );
        root.style.setProperty(
          '--lunasites-dropdown-color',
          colors.primary_color || '#094ce1',
        );
        root.style.setProperty(
          '--lunasites-dropdown-font-color',
          colors.tertiary_color || '#6bb535',
        );
        break;

      case 'minimal_white_navigation':
        root.style.setProperty(
          '--lunasites-header-bg-color',
          colors.tertiary_color || '#6bb535',
        );
        root.style.setProperty(
          '--lunasites-header-text-color',
          colors.neutral_color || '#222222',
        );
        root.style.setProperty(
          '--lunasites-dropdown-color',
          colors.primary_color || '#094ce1',
        );
        root.style.setProperty(
          '--lunasites-dropdown-font-color',
          colors.tertiary_color || '#6bb535',
        );
        break;

      case 'inverted_neutral_navigation':
        root.style.setProperty(
          '--lunasites-header-bg-color',
          colors.neutral_color || '#222222',
        );
        root.style.setProperty(
          '--lunasites-header-text-color',
          colors.background_color || '#ffffff',
        );
        root.style.setProperty(
          '--lunasites-dropdown-color',
          colors.tertiary_color || '#6bb535',
        );
        root.style.setProperty(
          '--lunasites-dropdown-font-color',
          colors.neutral_color || '#222222',
        );
        break;

      default:
        root.style.setProperty(
          '--lunasites-header-bg-color',
          colors.primary_color || '#094ce1',
        );
        root.style.setProperty(
          '--lunasites-header-text-color',
          colors.tertiary_color || '#6bb535',
        );
        root.style.setProperty(
          '--lunasites-dropdown-color',
          colors.neutral_color || '#222222',
        );
        root.style.setProperty(
          '--lunasites-dropdown-font-color',
          colors.tertiary_color || '#6bb535',
        );
    }
  };

  const applyContainerWidth = (width) => {
    const root = document.documentElement;

    const widthMapping = {
      narrow: '800px',
      normal: '1200px',
      wide: '1400px',
      full: '100vw',
    };

    const configuredValue = widthMapping[width] || widthMapping.normal;

    // Calculate available width for view mode (using body width)
    const bodyWidth = document.body.clientWidth || window.innerWidth;
    const availableWidth = bodyWidth - 40; // Small margin for view mode

    // Parse configured value to number (assuming px)
    const configuredPx = parseInt(configuredValue.replace('px', '')) || 1200;

    // Use the smaller of configured width or available screen width
    const finalWidth =
      width === 'full'
        ? '100vw'
        : `${Math.min(configuredPx, availableWidth)}px`;

    root.style.setProperty('--lunasites-container-width', finalWidth);
  };

  return viewClass ? <BodyClass className={viewClass} /> : null;
};

export default compose(
  injectLazyLibs(['reactDnd']),
  connect((state) => ({
    content: state.content.data,
    lunaTheming: state.lunaTheming,
    pathname: state.router?.location?.pathname,
    portal: state.content.data?.parent || state.content.data,
  })),
)(AppExtrasView);
