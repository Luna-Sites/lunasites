import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import { Button, Header, Dropdown } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { SimpleColorPickerCore } from 'lunasites-advanced-styling/Widgets/SimpleColorPicker';
import { useSelector } from 'react-redux';
import config from '@plone/registry';

const ColorSchemaField = (props) => {
  const { id, value, onChange } = props;

  const [colorSchema, setColorSchema] = React.useState({
    background_color: '',
    primary_color: '',
    secondary_color: '',
    header_bg_color: '',
    header_text_color: '',
    text_color: '',
    accent_color: '',
    dropdown_color: '',
    dropdown_font_color: '',
    ...value,
  });
  const [presets, setPresets] = React.useState([]);
  const [selectedPreset, setSelectedPreset] = React.useState('');

  // Get inherited color schema info similar to volto-footer
  const pathname = useSelector((state) => state.router?.location?.pathname);
  const [inheritedSchema, setInheritedSchema] = React.useState({});

  const colorFields = [
    {
      key: 'background_color',
      label: 'Background',
      description: 'Site background',
    },
    {
      key: 'primary_color',
      label: 'Primary',
      description: 'Main brand color',
    },
    {
      key: 'secondary_color',
      label: 'Secondary',
      description: 'Secondary accent',
    },
    {
      key: 'header_bg_color',
      label: 'Header BG',
      description: 'Header background',
    },
    {
      key: 'header_text_color',
      label: 'Header Text',
      description: 'Header text color',
    },
    {
      key: 'text_color',
      label: 'Text',
      description: 'Main text color',
    },
    {
      key: 'accent_color',
      label: 'Accent',
      description: 'Emphasis color',
    },
    {
      key: 'dropdown_color',
      label: 'Dropdown BG',
      description: 'Dropdown background',
    },
    {
      key: 'dropdown_font_color',
      label: 'Dropdown Text',
      description: 'Dropdown font color',
    },
  ];

  // Load presets and inherited schema on mount
  React.useEffect(() => {
    loadPresets();
    loadInheritedSchema();
  }, [pathname]);

  const isUrlExcluded = (url) => {
    const { nonContentRoutes = [], addonRoutes = [] } = config.settings;
    const matchesNonContent = nonContentRoutes.some((route) =>
      route instanceof RegExp ? route.test(url) : false,
    );
    const matchesAddon = addonRoutes.some((route) =>
      typeof route.path === 'string' ? url.startsWith(route.path) : false,
    );

    return matchesNonContent || matchesAddon;
  };

  const loadInheritedSchema = async () => {
    try {
      let cleanedUrl = pathname;

      // First clean the URL from /edit or /add
      if (pathname?.endsWith('/edit')) {
        cleanedUrl = cleanedUrl.slice(0, -'/edit'.length);
      }
      if (pathname?.endsWith('/add')) {
        cleanedUrl = cleanedUrl.slice(0, -'/add'.length);
      }
      // Then check if we need to use ++api++
      if (isUrlExcluded(pathname) || pathname.includes('/controlpanel'))
        cleanedUrl = window.location.origin + '/++api++' + cleanedUrl;
      const response = await fetch(
        `${cleanedUrl}/@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        const inheritedData =
          data['lunasites.behaviors.color_schema.IColorSchemaBehavior']?.data
            ?.color_schema || {};

        setInheritedSchema(inheritedData);
      }
    } catch (error) {
      console.error('Failed to load inherited color schema:', error);
    }
  };

  const getInheritedSchema = React.useCallback(() => {
    // Use the inherited schema from API call
    return inheritedSchema;
  }, [inheritedSchema]);

  // Update schema when value changes
  React.useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setColorSchema((prev) => ({ ...prev, ...value }));
    } else {
      // If value is empty/null, populate with inherited values
      const inherited = getInheritedSchema();
      const initialSchema = {
        background_color: inherited.background_color || '',
        primary_color: inherited.primary_color || '',
        secondary_color: inherited.secondary_color || '',
        header_bg_color: inherited.header_bg_color || '',
        header_text_color: inherited.header_text_color || '',
        text_color: inherited.text_color || '',
        accent_color: inherited.accent_color || '',
      };
      setColorSchema(initialSchema);

      // Save inherited values immediately
      const cleanedSchema = {};
      Object.entries(initialSchema).forEach(([key, value]) => {
        if (value && value.trim()) {
          cleanedSchema[key] = value;
        }
      });
      if (Object.keys(cleanedSchema).length > 0) {
        onChange(id, cleanedSchema);
      }
    }
  }, [value, getInheritedSchema, onChange, id]);

  const getEffectiveSchema = React.useCallback(() => {
    const inherited = getInheritedSchema();

    // Fallback to defaults only if no CSS variable is set
    const defaults = {
      background_color: '#ffffff',
      primary_color: '#0070ae',
      secondary_color: '#e73d5c',
      header_bg_color: '#ffffff',
      header_text_color: '#2c3e50',
      text_color: '#333333',
      accent_color: '#6bb535',
      dropdown_color: '#ffffff',
      dropdown_font_color: '#212529',
    };

    const current = {};
    Object.entries(colorSchema).forEach(([key, value]) => {
      if (value && value.trim()) {
        current[key] = value;
      }
    });

    // Use inherited values, fallback to defaults, then override with current
    const base = {};
    Object.keys(defaults).forEach((key) => {
      base[key] = inherited[key] || defaults[key];
    });

    return { ...base, ...current };
  }, [colorSchema, getInheritedSchema]);

  // Apply colors immediately when they change
  React.useEffect(() => {
    const effectiveSchema = getEffectiveSchema();
    if (effectiveSchema && Object.keys(effectiveSchema).length > 0) {
      applyCSSVariables(effectiveSchema);
    }
  }, [getEffectiveSchema]);

  const loadPresets = async () => {
    try {
      const response = await fetch('/@color-schema', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(data.presets || []);
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const handleColorChange = (field, color) => {
    const updatedSchema = { ...colorSchema, [field]: color || '' };
    setColorSchema(updatedSchema);

    // Save to form immediately - only save non-empty values
    const cleanedSchema = {};
    Object.entries(updatedSchema).forEach(([key, value]) => {
      if (value && value.trim()) {
        cleanedSchema[key] = value;
      }
    });
    onChange(id, cleanedSchema);

    // Apply to site immediately
    const effectiveSchema = { ...getEffectiveSchema(), [field]: color || '' };
    applyCSSVariables(effectiveSchema);
  };

  const clearColorSchema = () => {
    const emptySchema = {
      background_color: '',
      primary_color: '',
      secondary_color: '',
      header_bg_color: '',
      header_text_color: '',
      text_color: '',
      accent_color: '',
      dropdown_color: '',
      dropdown_font_color: '',
    };
    setColorSchema(emptySchema);
    onChange(id, {}); // Save empty object

    // Apply inherited/default colors
    const effectiveSchema = getEffectiveSchema();
    applyCSSVariables(effectiveSchema);

    toast.success('Colors cleared - using inherited values');
  };

  const applyPreset = (presetName) => {
    const preset = presets.find((p) => p.name === presetName);
    if (preset) {
      const presetSchema = { ...preset };
      delete presetSchema.name;

      // Clean preset schema - only save non-empty values
      const cleanedSchema = {};
      Object.entries(presetSchema).forEach(([key, value]) => {
        if (value && value.trim()) {
          cleanedSchema[key] = value;
        }
      });

      setColorSchema(presetSchema);
      onChange(id, cleanedSchema);
      applyCSSVariables(presetSchema);
      toast.success(`Applied preset: ${presetName}`);
    }
  };

  const applyCSSVariables = (schema) => {
    const root = document.documentElement;

    Object.entries(schema).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--lunasites-${key.replace(/_/g, '-')}`, value);
      }
    });

    // Generate derived colors for primary and secondary
    if (schema.primary_color) {
      // Create lighter and darker variants using color-mix if supported
      try {
        root.style.setProperty(
          '--lunasites-primary-light',
          `color-mix(in srgb, ${schema.primary_color} 80%, white)`,
        );
        root.style.setProperty(
          '--lunasites-primary-dark',
          `color-mix(in srgb, ${schema.primary_color} 80%, black)`,
        );
      } catch (e) {
        // Fallback for browsers without color-mix support
        root.style.setProperty(
          '--lunasites-primary-light',
          schema.primary_color,
        );
        root.style.setProperty(
          '--lunasites-primary-dark',
          schema.primary_color,
        );
      }
    }

    if (schema.secondary_color) {
      try {
        root.style.setProperty(
          '--lunasites-secondary-light',
          `color-mix(in srgb, ${schema.secondary_color} 80%, white)`,
        );
        root.style.setProperty(
          '--lunasites-secondary-dark',
          `color-mix(in srgb, ${schema.secondary_color} 80%, black)`,
        );
      } catch (e) {
        root.style.setProperty(
          '--lunasites-secondary-light',
          schema.secondary_color,
        );
        root.style.setProperty(
          '--lunasites-secondary-dark',
          schema.secondary_color,
        );
      }
    }

    // Trigger event for other components
    window.dispatchEvent(
      new CustomEvent('colorSchemaApplied', {
        detail: { schema },
      }),
    );
  };

  const getPresetOptions = () => {
    return [
      { key: '', text: 'Choose a preset...', value: '' },
      ...presets.map((preset) => ({
        key: preset.name,
        text: preset.name,
        value: preset.name,
      })),
    ];
  };

  return (
    <FormFieldWrapper {...props} className="color-schema-field">
      <div style={{ width: '100%', maxWidth: '100%' }}>
        {/* Presets Dropdown
        <div style={{ marginBottom: '10px' }}>
          <Dropdown
            placeholder="Choose preset..."
            fluid
            selection
            value={selectedPreset}
            onChange={(_, { value }) => {
              setSelectedPreset(value);
              if (value) {
                applyPreset(value);
              }
            }}
            options={getPresetOptions()}
            size="mini"
            style={{ fontSize: '11px' }}
          />
        </div> */}
        {/* Color Fields - Grid Layout */}
        <div className="color-grid">
          {colorFields.map((field) => (
            <div key={field.key} className="color-item">
              <SimpleColorPickerCore
                id={field.key}
                value={
                  colorSchema[field.key] ||
                  getInheritedSchema()[field.key] ||
                  '#cccccc'
                }
                onChange={(_, color) => handleColorChange(field.key, color)}
                showGradientOption={false}
              />
              <div className="color-label">{field.label}</div>
            </div>
          ))}
        </div>
        {/* Clear Button */}
      </div>
    </FormFieldWrapper>
  );
};

export default ColorSchemaField;
