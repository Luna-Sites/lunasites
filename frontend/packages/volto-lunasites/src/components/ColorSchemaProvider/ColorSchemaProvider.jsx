import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getColorSchemaInherit } from '../../actions';

const ColorSchemaProvider = ({ children }) => {
  const dispatch = useDispatch();
  const pathname = useSelector((state) => state.router.location?.pathname);
  const colorSchemaInherit = useSelector(
    (state) =>
      state?.colorSchemaInherit?.data?.[
        'lunasites.behaviors.color_schema.IColorSchemaBehavior'
      ]?.data?.color_schema,
  );
  const loading = useSelector((state) => state?.colorSchemaInherit?.loading);

  // Load inherited color schema when pathname changes
  useEffect(() => {
    if (pathname) {
      dispatch(getColorSchemaInherit(pathname));
    }
  }, [dispatch, pathname]);

  // Apply CSS variables when color schema is loaded
  useEffect(() => {
    if (colorSchemaInherit && !loading) {
      applyCSSVariables(colorSchemaInherit);
    }
  }, [colorSchemaInherit, loading]);

  const applyCSSVariables = (schema) => {
    const root = document.documentElement;

    // Default fallbacks
    const defaultSchema = {
      background_color: '#ffffff',
      primary_color: '#0070ae',
      secondary_color: '#e73d5c',
      header_bg_color: '#ffffff',
      header_text_color: '#2c3e50',
      text_color: '#333333',
      accent_color: '#6bb535',
      toolbar_color: '#f8f9fa',
      toolbar_font_color: '#212529',
      toolbar_border_color: '#dee2e6',
      toolbar_border_thickness: '1px',
      dropdown_color: '#ffffff',
      dropdown_font_color: '#212529',
    };

    // Merge with defaults
    const finalSchema = { ...defaultSchema, ...schema };

    // Apply CSS variables
    Object.entries(finalSchema).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--lunasites-${key.replace(/_/g, '-')}`, value);
      }
    });

    // Generate derived colors
    if (finalSchema.primary_color) {
      const primaryColor = finalSchema.primary_color;

      // Create lighter and darker variants using CSS color-mix
      root.style.setProperty(
        '--lunasites-primary-light',
        `color-mix(in srgb, ${primaryColor} 80%, white)`,
      );
      root.style.setProperty(
        '--lunasites-primary-dark',
        `color-mix(in srgb, ${primaryColor} 80%, black)`,
      );
    }

    if (finalSchema.secondary_color) {
      const secondaryColor = finalSchema.secondary_color;

      root.style.setProperty(
        '--lunasites-secondary-light',
        `color-mix(in srgb, ${secondaryColor} 80%, white)`,
      );
      root.style.setProperty(
        '--lunasites-secondary-dark',
        `color-mix(in srgb, ${secondaryColor} 80%, black)`,
      );
    }

    // Trigger a custom event to notify other components
    window.dispatchEvent(
      new CustomEvent('colorSchemaApplied', {
        detail: { schema: finalSchema },
      }),
    );
  };

  return <>{children}</>;
};

export default ColorSchemaProvider;
