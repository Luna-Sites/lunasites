import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDesignSite } from '../../actions';

const DesignSchemaProvider = ({ children }) => {
  const dispatch = useDispatch();
  const pathname = useSelector((state) => state.router.location?.pathname);
  const designSchema = useSelector(
    (state) =>
      state?.designSchema?.data?.[
        'lunasites.behaviors.design_schema.IDesignSchema'
      ]?.data?.color_schema,
  );
  const loading = useSelector((state) => state?.designSchema?.loading);

  // Load inherited design schema when pathname changes
  useEffect(() => {
    if (pathname) {
      dispatch(getDesignSite(pathname));
    }
  }, [dispatch, pathname]);

  // Apply CSS variables when design schema is loaded
  useEffect(() => {
    if (designSchema && !loading) {
      applyCSSVariables(designSchema);
    }
  }, [designSchema, loading]);

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
      new CustomEvent('designSchemaApplied', {
        detail: { schema: finalSchema },
      }),
    );
  };

  return <>{children}</>;
};

export default DesignSchemaProvider;