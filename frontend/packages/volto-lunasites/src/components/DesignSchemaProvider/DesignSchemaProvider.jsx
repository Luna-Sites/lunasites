import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDesignSite } from '../../actions';

const DesignSchemaProvider = ({ children }) => {
  const dispatch = useDispatch();
  const pathname = useSelector((state) => state.router.location?.pathname);
  const designSchemaData = useSelector(
    (state) =>
      state?.designSchema?.data?.[
        'lunasites.behaviors.design_schema.IDesignSchema'
      ]?.data,
  );
  
  const designSchema = designSchemaData?.color_schema;
  const loading = useSelector((state) => state?.designSchema?.loading);

  // Load inherited design schema when pathname changes
  useEffect(() => {
    if (pathname) {
      // Try to apply cached data immediately before making request
      const cachedData = getCachedDesignSchema(pathname);
      if (cachedData) {
        if (cachedData.designSchema) {
          applyCSSVariables(cachedData.designSchema);
        }
        if (cachedData.designSchemaData) {
          applyLayoutVariables(cachedData.designSchemaData);
          applyViewType(cachedData.designSchemaData);
        }
      }
      
      dispatch(getDesignSite(pathname));
    }
  }, [dispatch, pathname]);

  // Apply CSS variables as soon as data is available, even during loading
  useEffect(() => {
    if (designSchema) {
      applyCSSVariables(designSchema);
    }
    if (designSchemaData) {
      applyLayoutVariables(designSchemaData);
      applyViewType(designSchemaData);
      
      // Cache the data for immediate use on next visit
      setCachedDesignSchema(pathname, {
        designSchema,
        designSchemaData,
        timestamp: Date.now()
      });
    }
  }, [designSchema, designSchemaData, pathname]);

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

  const detectWidthType = (widthValue) => {
    if (!widthValue) return null;
    
    const widthStr = widthValue.toString().trim().toLowerCase();
    
    // Check for relative units
    if (/(%|vw|vh|vmin|vmax|em|rem)/.test(widthStr)) {
      return 'relative';
    }
    
    // Check for fixed units
    if (/(px|pt|cm|mm|in|pc)/.test(widthStr)) {
      return 'fixed';
    }
    
    // If no unit specified, assume pixels (fixed)
    if (/^\d+(\.\d+)?$/.test(widthStr)) {
      return 'fixed';
    }
    
    // Default to relative for unrecognized formats
    return 'relative';
  };

  const applyLayoutVariables = (data) => {
    const root = document.documentElement;

    // Handle navbar width
    if (data.navbar_width) {
      const navbarWidth = data.navbar_width;
      const navbarWidthType = detectWidthType(navbarWidth);
      
      root.style.setProperty('--lunasites-navbar-width', navbarWidth);
      root.style.setProperty('--lunasites-navbar-width-type', navbarWidthType);
      
      // Add custom-width class to header
      const header = document.querySelector('.header-wrapper .header');
      if (header) {
        header.classList.add('custom-width');
      }
    } else {
      // Remove custom-width class if no navbar width is set
      const header = document.querySelector('.header-wrapper .header');
      if (header) {
        header.classList.remove('custom-width');
      }
    }

    // Handle container width
    if (data.container_width) {
      const containerWidth = data.container_width;
      const containerWidthType = detectWidthType(containerWidth);
      
      root.style.setProperty('--lunasites-container-width', containerWidth);
      root.style.setProperty('--lunasites-container-width-type', containerWidthType);
    }

    // Trigger layout change event
    window.dispatchEvent(
      new CustomEvent('layoutVariablesApplied', {
        detail: { 
          navbarWidth: data.navbar_width,
          navbarWidthType: detectWidthType(data.navbar_width),
          containerWidth: data.container_width,
          containerWidthType: detectWidthType(data.container_width)
        },
      }),
    );
  };

  const applyViewType = (data) => {
    const body = document.body;
    
    // Remove existing view classes
    const viewClasses = ['view-homepage', 'view-homepage-inverse', 'view-default'];
    viewClasses.forEach(className => {
      body.classList.remove(className);
    });
    
    // Get view type value - handle both string and object formats
    let viewType = data.view_type;
    
    // Debug logging
    console.log('View type received:', viewType, typeof viewType);
    
    if (viewType && typeof viewType === 'object') {
      // If it's an object, try to get the value or token
      viewType = viewType.value || viewType.token || viewType.title;
      console.log('Extracted view type:', viewType);
    }
    
    // Apply new view type if specified
    if (viewType && typeof viewType === 'string') {
      body.classList.add(`view-${viewType}`);
    } else {
      // Default view if no view_type specified
      body.classList.add('view-default');
    }

    // Trigger view type change event
    window.dispatchEvent(
      new CustomEvent('viewTypeApplied', {
        detail: { 
          viewType: viewType || 'default'
        },
      }),
    );
  };

  const getCachedDesignSchema = (pathname) => {
    try {
      const cacheKey = `designSchema_${pathname}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is less than 5 minutes old
        if (Date.now() - data.timestamp < 5 * 60 * 1000) {
          return data;
        }
        // Remove expired cache
        localStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.warn('Error reading design schema cache:', error);
    }
    return null;
  };

  const setCachedDesignSchema = (pathname, data) => {
    try {
      const cacheKey = `designSchema_${pathname}`;
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Error caching design schema:', error);
    }
  };

  return <>{children}</>;
};

export default DesignSchemaProvider;