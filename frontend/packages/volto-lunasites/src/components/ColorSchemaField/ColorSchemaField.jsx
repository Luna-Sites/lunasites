import React from 'react';
import { FormFieldWrapper, Icon, SidebarPopup } from '@plone/volto/components';
import { Button, Header } from 'semantic-ui-react';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import { toast } from 'react-toastify';
import { SimpleColorPickerCore } from 'lunasites-advanced-styling/Widgets/SimpleColorPicker';
import { useSelector, useDispatch } from 'react-redux';
import config from '@plone/registry';
import { getDesignSite } from '../../actions/colorSchema';
import { getLunaTheming, setLunaTheming } from '../../actions';
import { ModernColorPicker } from '../ColorPicker';

const ColorSchemaField = (props) => {
  const { id, value, onChange } = props;
  const dispatch = useDispatch();

  const [colorSchema, setColorSchema] = React.useState({
    background_color: '',
    neutral_color: '',
    primary_color: '',
    secondary_color: '',
    tertiary_color: '',
    ...value,
  });
  const [presets, setPresets] = React.useState([]);
  const [selectedPreset, setSelectedPreset] = React.useState('');
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [originalColorsForPreview, setOriginalColorsForPreview] =
    React.useState(null);
  const [activeColorPicker, setActiveColorPicker] = React.useState(null);

  const colorFields = [
    {
      key: 'background_color',
      label: 'Background',
      description: 'Site background color',
    },
    {
      key: 'neutral_color',
      label: 'Neutral',
      description: 'Main text and neutral color',
    },
    {
      key: 'primary_color',
      label: 'Primary',
      description: 'Main brand color',
    },
    {
      key: 'secondary_color',
      label: 'Secondary',
      description: 'Secondary brand color',
    },
    {
      key: 'tertiary_color',
      label: 'Tertiary',
      description: 'Tertiary accent color',
    },
  ];

  // Load presets on mount
  React.useEffect(() => {
    loadPresets();
  }, []);


  // Update schema when value changes
  React.useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setColorSchema((prev) => ({ ...prev, ...value }));
    }
  }, [value]);

  const getEffectiveSchema = React.useCallback(() => {
    // Return just the current colors with defaults
    const defaults = {
      background_color: '#ffffff',
      neutral_color: '#222222',
      primary_color: '#094ce1',
      secondary_color: '#e73d5c',
      tertiary_color: '#6bb535',
    };

    const effective = { ...defaults };

    // Apply current values
    Object.entries(colorSchema).forEach(([key, value]) => {
      if (value && value.trim()) {
        effective[key] = value;
      }
    });

    return effective;
  }, [colorSchema]);

  // Apply colors immediately when they change
  React.useEffect(() => {
    const effectiveSchema = getEffectiveSchema();
    if (effectiveSchema && Object.keys(effectiveSchema).length > 0) {
      applyCSSVariables(effectiveSchema);
    }
  }, [getEffectiveSchema]);

  // Practical, real‑world presets designed to make sites look great out of the box
  // Schema preserved: background_color, text_color, primary_color, secondary_color, accent_color
  // All combos aim for WCAG AA contrast on body text.

  const generatePracticalPresets = () => [
    {
      name: 'Palette 1',
      background_color: '#FFFFFF',
      neutral_color: '#222222',
      primary_color: '#000000',
      secondary_color: '#EEEEEE',
      tertiary_color: '#F8F8F8',
    },
    {
      name: 'Palette 2',
      background_color: '#FFFFFF',
      neutral_color: '#1A1B20',
      primary_color: '#3A69F3',
      secondary_color: '#F0F0F2',
      tertiary_color: '#F7F8F8',
    },
    {
      name: 'Palette 3',
      background_color: '#FFFFFF',
      neutral_color: '#020826',
      primary_color: '#F25042',
      secondary_color: '#EADDCF',
      tertiary_color: '#F9F4EF',
    },
    {
      name: 'Palette 4',
      background_color: '#FFFFFF',
      neutral_color: '#34384F',
      primary_color: '#62BFAD',
      secondary_color: '#D0ECE6',
      tertiary_color: '#F9F7E8',
    },
    {
      name: 'Palette 5',
      background_color: '#FFFFFF',
      neutral_color: '#0D192A',
      primary_color: '#C757C9',
      secondary_color: '#F8B8DE',
      tertiary_color: '#F1EFE5',
    },
    {
      name: 'Palette 6',
      background_color: '#FFFFFF',
      neutral_color: '#000000',
      primary_color: '#28E8AE',
      secondary_color: '#6E29FF',
      tertiary_color: '#EDEDED',
    },
    {
      name: 'Palette 7',
      background_color: '#FFFFFF',
      neutral_color: '#282F3A',
      primary_color: '#26D07C',
      secondary_color: '#DBE2E9',
      tertiary_color: '#F5F5F1',
    },
    {
      name: 'Palette 8',
      background_color: '#FFFFFF',
      neutral_color: '#0052CC',
      primary_color: '#1664D9',
      secondary_color: '#E7EDF6',
      tertiary_color: '#F2F7FD',
    },
    {
      name: 'Palette 9',
      background_color: '#FFFFFF',
      neutral_color: '#D01818',
      primary_color: '#E74646',
      secondary_color: '#FDD3CA',
      tertiary_color: '#FFF3E2',
    },
    {
      name: 'Palette 10',
      background_color: '#FFFFFF',
      neutral_color: '#4C39C3',
      primary_color: '#C155D5',
      secondary_color: '#FFBCA7',
      tertiary_color: '#FAF2E5',
    },
    {
      name: 'Palette 11',
      background_color: '#FFFFFF',
      neutral_color: '#424330',
      primary_color: '#F2B717',
      secondary_color: '#AA5939',
      tertiary_color: '#DFD5BB',
    },
    {
      name: 'Palette 12',
      background_color: '#FFFFFF',
      neutral_color: '#220011',
      primary_color: '#006868',
      secondary_color: '#EBA180',
      tertiary_color: '#EAEACF',
    },
    {
      name: 'Palette 13',
      background_color: '#FFFFFF',
      neutral_color: '#232323',
      primary_color: '#078080',
      secondary_color: '#F45D48',
      tertiary_color: '#F8F5F2',
    },
    {
      name: 'Palette 14',
      background_color: '#FFFFFF',
      neutral_color: '#00214D',
      primary_color: '#00EBC7',
      secondary_color: '#FF5470',
      tertiary_color: '#FDE24F',
    },
    {
      name: 'Palette 15',
      background_color: '#FFFFFF',
      neutral_color: '#131222',
      primary_color: '#3A2F87',
      secondary_color: '#D5ADA3',
      tertiary_color: '#F6F1DB',
    },
    {
      name: 'Palette 16',
      background_color: '#FFFFFF',
      neutral_color: '#334359',
      primary_color: '#FD6574',
      secondary_color: '#E6E6E4',
      tertiary_color: '#F9F5EF',
    },
    {
      name: 'Palette 17',
      background_color: '#FFFFFF',
      neutral_color: '#2C3E50',
      primary_color: '#E74C3C',
      secondary_color: '#3498DB',
      tertiary_color: '#ECF0F1',
    },
    {
      name: 'Palette 18',
      background_color: '#FFFFFF',
      neutral_color: '#094775',
      primary_color: '#2E8EEC',
      secondary_color: '#EAA7FD',
      tertiary_color: '#F6EBF8',
    },
    {
      name: 'Palette 19',
      background_color: '#FFFFFF',
      neutral_color: '#165076',
      primary_color: '#398ECE',
      secondary_color: '#EADDC2',
      tertiary_color: '#FAF8F2',
    },
    {
      name: 'Palette 20',
      background_color: '#FFFFFF',
      neutral_color: '#0D0D0D',
      primary_color: '#FF8E3C',
      secondary_color: '#D9376E',
      tertiary_color: '#EFF0F3',
    },
    {
      name: 'Palette 21',
      background_color: '#FFFFFF',
      neutral_color: '#020035',
      primary_color: '#2000B1',
      secondary_color: '#ED4B00',
      tertiary_color: '#EBEAED',
    },
    {
      name: 'Palette 22',
      background_color: '#FFFFFF',
      neutral_color: '#2D4059',
      primary_color: '#EA5455',
      secondary_color: '#F07B3F',
      tertiary_color: '#FFD460',
    },
    {
      name: 'Palette 23',
      background_color: '#FFFFFF',
      neutral_color: '#1F2521',
      primary_color: '#41A167',
      secondary_color: '#EFDD3B',
      tertiary_color: '#F8F4E6',
    },
    {
      name: 'Palette 24',
      background_color: '#FFFFFF',
      neutral_color: '#0F1939',
      primary_color: '#26428B',
      secondary_color: '#E3AF64',
      tertiary_color: '#FAEBD7',
    },
    {
      name: 'Palette 25',
      background_color: '#FFFFFF',
      neutral_color: '#040348',
      primary_color: '#FD2282',
      secondary_color: '#330099',
      tertiary_color: '#FFB800',
    },
    {
      name: 'Palette 26',
      background_color: '#FFFFFF',
      neutral_color: '#303F52',
      primary_color: '#ED8063',
      secondary_color: '#AA455B',
      tertiary_color: '#E7D6C4',
    },
    {
      name: 'Palette 27',
      background_color: '#FFFFFF',
      neutral_color: '#253145',
      primary_color: '#3F88EB',
      secondary_color: '#3AAB87',
      tertiary_color: '#F0F5F8',
    },
    {
      name: 'Palette 28',
      background_color: '#FFFFFF',
      neutral_color: '#112046',
      primary_color: '#2D4A91',
      secondary_color: '#F6A288',
      tertiary_color: '#F3DFCB',
    },
    {
      name: 'Palette 29',
      background_color: '#FFFFFF',
      neutral_color: '#3B4357',
      primary_color: '#2E8DDE',
      secondary_color: '#CB3C6F',
      tertiary_color: '#ECE9E1',
    },
    {
      name: 'Palette 30',
      background_color: '#FFFFFF',
      neutral_color: '#1D2D5F',
      primary_color: '#F65E5D',
      secondary_color: '#FFBC47',
      tertiary_color: '#40CEE3',
    },
    {
      name: 'Palette 31',
      background_color: '#F4F1EC',
      neutral_color: '#111144',
      primary_color: '#F98513',
      secondary_color: '#223382',
      tertiary_color: '#FFFFFF',
    },
    {
      name: 'Palette 32',
      background_color: '#EBE6D1',
      neutral_color: '#2E303F',
      primary_color: '#C24332',
      secondary_color: '#63948C',
      tertiary_color: '#FFFFFF',
    },
    {
      name: 'Palette 33',
      background_color: '#FAF8F2',
      neutral_color: '#324846',
      primary_color: '#00B8A9',
      secondary_color: '#F6416C',
      tertiary_color: '#FFDE7D',
    },
    {
      name: 'Palette 34',
      background_color: '#F5F3E8',
      neutral_color: '#441735',
      primary_color: '#D75858',
      secondary_color: '#8D7666',
      tertiary_color: '#FFFFFF',
    },
    {
      name: 'Palette 35',
      background_color: '#F2EEF5',
      neutral_color: '#181818',
      primary_color: '#994FF3',
      secondary_color: '#4FC4CF',
      tertiary_color: '#FBDD74',
    },
    {
      name: 'Palette 36',
      background_color: '#F5F3EF',
      neutral_color: '#0A3F55',
      primary_color: '#E93024',
      secondary_color: '#FF7C44',
      tertiary_color: '#BBC3B5',
    },
    {
      name: 'Palette 37',
      background_color: '#E5EDE5',
      neutral_color: '#114946',
      primary_color: '#0E8544',
      secondary_color: '#A3C1B5',
      tertiary_color: '#F3CF11',
    },
    {
      name: 'Palette 38',
      background_color: '#E2E4E4',
      neutral_color: '#2D4D58',
      primary_color: '#FF5B16',
      secondary_color: '#7C41D1',
      tertiary_color: '#FFFFFF',
    },
    {
      name: 'Palette 39',
      background_color: '#F7D3AD',
      neutral_color: '#023C40',
      primary_color: '#794EF2',
      secondary_color: '#FF7356',
      tertiary_color: '#FFFFFF',
    },
    {
      name: 'Palette 40',
      background_color: '#08089B',
      neutral_color: '#FFFFFF',
      primary_color: '#DD0DCC',
      secondary_color: '#0AA67A',
      tertiary_color: '#1919A9',
    },
    {
      name: 'Palette 41',
      background_color: '#850E35',
      neutral_color: '#FFFFFF',
      primary_color: '#EE6983',
      secondary_color: '#FFC4C4',
      tertiary_color: '#FFF5E4',
    },
    {
      name: 'Palette 42',
      background_color: '#0C4325',
      neutral_color: '#FFFFFF',
      primary_color: '#0AC642',
      secondary_color: '#6E9079',
      tertiary_color: '#0E4A29',
    },
    {
      name: 'Palette 43',
      background_color: '#000000',
      neutral_color: '#FFFFFF',
      primary_color: '#F5F5F5',
      secondary_color: '#333333',
      tertiary_color: '#1A1A1A',
    },
    {
      name: 'Palette 44',
      background_color: '#000000',
      neutral_color: '#FAFAFA',
      primary_color: '#4B99FF',
      secondary_color: '#333333',
      tertiary_color: '#1A1A1A',
    },
    {
      name: 'Palette 45',
      background_color: '#000000',
      neutral_color: '#FAFAFA',
      primary_color: '#FFEB66',
      secondary_color: '#333333',
      tertiary_color: '#1A1A1A',
    },
    {
      name: 'Palette 46',
      background_color: '#111111',
      neutral_color: '#FFFFFF',
      primary_color: '#F15952',
      secondary_color: '#0491FD',
      tertiary_color: '#06BC73',
    },
    {
      name: 'Palette 47',
      background_color: '#151632',
      neutral_color: '#F1F0EF',
      primary_color: '#66EEBB',
      secondary_color: '#8D5EB7',
      tertiary_color: '#57317E',
    },
    {
      name: 'Palette 48',
      background_color: '#0F0E17',
      neutral_color: '#FFFFFF',
      primary_color: '#FF8906',
      secondary_color: '#F25F4C',
      tertiary_color: '#E53170',
    },
    {
      name: 'Palette 49',
      background_color: '#16161A',
      neutral_color: '#FFFFFF',
      primary_color: '#7F5AF0',
      secondary_color: '#2CB67D',
      tertiary_color: '#252733',
    },
    {
      name: 'Palette 50',
      background_color: '#142030',
      neutral_color: '#FFFFFF',
      primary_color: '#FF5C8D',
      secondary_color: '#85A3B2',
      tertiary_color: '#1E3442',
    },
    {
      name: 'Palette 51',
      background_color: '#15151C',
      neutral_color: '#F5F4ED',
      primary_color: '#CF9F52',
      secondary_color: '#4A2125',
      tertiary_color: '#24313D',
    },
  ];

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
      } else {
        // Fallback to mock presets if API fails
        setPresets(generatePracticalPresets());
      }
    } catch (error) {
      console.error('Failed to load presets:', error);
      // Use mock presets as fallback
      setPresets(generatePracticalPresets());
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

    // Update Plone registry with the color changes
    const registryData = {
      colors: {
        background_color: effectiveSchema.background_color || '#ffffff',
        neutral_color: effectiveSchema.neutral_color || '#222222',
        primary_color: effectiveSchema.primary_color || '#094ce1',
        secondary_color: effectiveSchema.secondary_color || '#e73d5c',
        tertiary_color: effectiveSchema.tertiary_color || '#6bb535',
      }
    };
    console.log('Sending to registry:', registryData);
    dispatch(setLunaTheming(registryData)).then(() => {
      // Refresh Redux state after backend update
      dispatch(getLunaTheming());
    });
  };

  const clearColorSchema = () => {
    const emptySchema = {
      background_color: '',
      neutral_color: '',
      primary_color: '',
      secondary_color: '',
      tertiary_color: '',
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

    // Clear registry by setting default values
    const defaultRegistryData = {
      colors: {
        background_color: '#ffffff',
        neutral_color: '#222222',
        primary_color: '#094ce1',
        secondary_color: '#e73d5c',
        tertiary_color: '#6bb535',
      }
    };
    dispatch(setLunaTheming(defaultRegistryData)).then(() => {
      // Refresh Redux state after backend update
      dispatch(getLunaTheming());
    });

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

      // Update Plone registry with the preset colors
      const registryData = {
        colors: {
          background_color: presetSchema.background_color || '#ffffff',
          neutral_color: presetSchema.neutral_color || '#222222',
          primary_color: presetSchema.primary_color || '#094ce1',
          secondary_color: presetSchema.secondary_color || '#e73d5c',
          tertiary_color: presetSchema.tertiary_color || '#6bb535',
        }
      };
      dispatch(setLunaTheming(registryData)).then(() => {
        // Refresh Redux state after backend update
        dispatch(getLunaTheming());
      });

      toast.success(`Applied preset: ${presetName}`);
    }
  };

  const closeSidebar = React.useCallback(() => {
    setShowSidebar(false);
    // Restore original colors if we were previewing
    if (originalColorsForPreview) {
      applyCSSVariables(originalColorsForPreview);
      setOriginalColorsForPreview(null);
    }
  }, [originalColorsForPreview]);

  const previewPreset = React.useCallback(
    (preset) => {
      // Store original colors if not already stored
      if (!originalColorsForPreview) {
        const currentEffectiveSchema = getEffectiveSchema();
        setOriginalColorsForPreview(currentEffectiveSchema);
      }

      // Apply preset colors for preview
      const presetSchema = { ...preset };
      delete presetSchema.name;
      applyCSSVariables(presetSchema);
    },
    [originalColorsForPreview, getEffectiveSchema],
  );

  const stopPreview = React.useCallback(() => {
    // Restore original colors
    if (originalColorsForPreview) {
      applyCSSVariables(originalColorsForPreview);
      setOriginalColorsForPreview(null);
    }
  }, [originalColorsForPreview]);

  // Close color picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeColorPicker && !event.target.closest('.color-card-container')) {
        setActiveColorPicker(null);
      }
    };

    if (activeColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [activeColorPicker]);


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

  const generateColorPreview = () => {
    const effectiveSchema = getEffectiveSchema();
    const circleColors = colorFields.filter(
      (field) => field.key !== 'background_color',
    );
    const backgroundColor = effectiveSchema.background_color || '#ffffff';

    return (
      <div
        role="button"
        tabIndex={0}
        style={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          marginBottom: '15px',
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Preview clicked, setting sidebar to true');
          setShowSidebar(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setShowSidebar(true);
          }
        }}
        onMouseEnter={(e) => {
          const preview = e.currentTarget.querySelector(
            '.current-theme-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1.05)';
            preview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          const preview = e.currentTarget.querySelector(
            '.current-theme-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1)';
            preview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }
        }}
        aria-label="Open color theme editor"
      >
        {/* Overlapping Circles Preview */}
        <div
          className="current-theme-preview"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50px',
            borderRadius: '25px',
            backgroundColor: backgroundColor,
            border: '2px solid #eee',
            padding: '8px 15px',
            position: 'relative',
            overflow: 'visible',
            marginBottom: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: 'fit-content',
            margin: '0 auto 8px auto',
          }}
        >
          {circleColors.map((field, index) => (
            <div
              key={field.key}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: effectiveSchema[field.key] || '#cccccc',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                marginLeft: index > 0 ? '-12px' : '0',
                zIndex: circleColors.length - index,
                position: 'relative',
              }}
              title={field.label}
            />
          ))}
        </div>

        {/* Theme Name */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151',
            lineHeight: '1.3',
          }}
        >
          Color Theme
        </div>
      </div>
    );
  };

  return (
    <FormFieldWrapper {...props} className="color-schema-field">
      <div style={{ width: '100%', maxWidth: '100%' }}>
        {/* Color Preview with Overlapping Circles */}
        {generateColorPreview()}

        {/* Sidebar with Color Editor */}
        <SidebarPopup open={showSidebar} onClose={closeSidebar}>
          <Header style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            Color Schema Editor
            <button
              onClick={clearColorSchema}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              <Icon name={rightArrowSVG} size="24px" title="Clear Colors" />
            </button>
          </Header>

          <div
            style={{
              padding: '20px',
              height: 'calc(100vh - 80px)',
              width: '100%',
              overflowY: 'auto',
            }}
          >
            {/* Main Color Grid - 2 top, 3 bottom */}
            <div style={{ marginBottom: '30px' }}>
              <Header as="h3">Color Palette</Header>

              {/* Top Row: Background and Neutral */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '15px',
                }}
              >
                {colorFields.slice(0, 2).map((field) => {
                  const currentColor = colorSchema[field.key] || '';
                  return (
                    <div
                      key={field.key}
                      className="color-card-container"
                      style={{
                        height: '80px',
                        backgroundColor: currentColor,
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        position: 'relative',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '10px',
                        color:
                          field.key === 'background_color'
                            ? colorSchema.neutral_color || '#333'
                            : field.key === 'neutral_color'
                              ? colorSchema.background_color || '#fff'
                              : '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                      onClick={() => {
                        setActiveColorPicker(
                          activeColorPicker === field.key ? null : field.key
                        );
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            lineHeight: '1.2',
                          }}
                        >
                          {field.label}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          fontWeight: '500',
                        }}
                      >
                        <input
                          type="text"
                          value={currentColor.toUpperCase()}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!value.startsWith('#') && value.length > 0) {
                              value = '#' + value;
                            }
                            if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                              if (value.length === 7) {
                                handleColorChange(field.key, value);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            let value = e.target.value;
                            if (!value.startsWith('#') && value.length > 0) {
                              value = '#' + value;
                            }
                            if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                              handleColorChange(field.key, value);
                            } else if (value.length > 0) {
                              // Reset to original if invalid
                              e.target.value = currentColor.toUpperCase();
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            fontWeight: '500',
                            color: 'inherit',
                            textAlign: 'center',
                            width: '100%',
                            outline: 'none'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Custom Color Picker */}
                      {activeColorPicker === field.key && (
                        <ModernColorPicker
                          field={field}
                          currentColor={currentColor}
                          onColorChange={handleColorChange}
                          onClose={() => setActiveColorPicker(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Row: Primary, Secondary, Tertiary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '15px',
                }}
              >
                {colorFields.slice(2, 5).map((field) => {
                  const currentColor = colorSchema[field.key] || '';
                  return (
                    <div
                      key={field.key}
                      className="color-card-container"
                      style={{
                        height: '80px',
                        backgroundColor: currentColor,
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        position: 'relative',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '10px',
                        color:
                          field.key === 'primary_color'
                            ? colorSchema.background_color || '#fff'
                            : field.key === 'secondary_color'
                              ? colorSchema.neutral_color || '#fff'
                              : field.key === 'tertiary_color'
                                ? colorSchema.neutral_color || '#fff'
                                : '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                      onClick={() => {
                        setActiveColorPicker(
                          activeColorPicker === field.key ? null : field.key
                        );
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            lineHeight: '1.2',
                          }}
                        >
                          {field.label}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          fontWeight: '500',
                        }}
                      >
                        <input
                          type="text"
                          value={currentColor.toUpperCase()}
                          onChange={(e) => {
                            let value = e.target.value;
                            if (!value.startsWith('#') && value.length > 0) {
                              value = '#' + value;
                            }
                            if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                              if (value.length === 7) {
                                handleColorChange(field.key, value);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            let value = e.target.value;
                            if (!value.startsWith('#') && value.length > 0) {
                              value = '#' + value;
                            }
                            if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
                              handleColorChange(field.key, value);
                            } else if (value.length > 0) {
                              // Reset to original if invalid
                              e.target.value = currentColor.toUpperCase();
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            fontWeight: '500',
                            color: 'inherit',
                            textAlign: 'center',
                            width: '100%',
                            outline: 'none'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Custom Color Picker */}
                      {activeColorPicker === field.key && (
                        <ModernColorPicker
                          field={field}
                          currentColor={currentColor}
                          onColorChange={handleColorChange}
                          onClose={() => setActiveColorPicker(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preset Styles */}
            <div>
              <Header as="h3">Preset Styles</Header>
              {presets.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    alignItems: 'center',
                  }}
                >
                  {presets.map((preset) => {
                    const circleColors = colorFields.filter(
                      (field) => field.key !== 'background_color',
                    );
                    const backgroundColor =
                      preset.background_color || '#ffffff';

                    return (
                      <div
                        key={preset.name}
                        role="button"
                        tabIndex={0}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                        }}
                        onClick={() => applyPreset(preset.name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            applyPreset(preset.name);
                          }
                        }}
                        onMouseEnter={(e) => {
                          const preview =
                            e.currentTarget.querySelector('.preset-preview');
                          if (preview) {
                            preview.style.transform = 'scale(1.05)';
                            preview.style.boxShadow =
                              '0 8px 20px rgba(0,0,0,0.15)';
                          }
                          // Preview colors on site
                          previewPreset(preset);
                        }}
                        onMouseLeave={(e) => {
                          const preview =
                            e.currentTarget.querySelector('.preset-preview');
                          if (preview) {
                            preview.style.transform = 'scale(1)';
                            preview.style.boxShadow =
                              '0 2px 8px rgba(0,0,0,0.1)';
                          }
                          // Stop preview and restore original colors
                          stopPreview();
                        }}
                      >
                        {/* Overlapping Circles Preview */}
                        <div
                          className="preset-preview"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '50px',
                            borderRadius: '25px',
                            backgroundColor: backgroundColor,
                            border: '2px solid #eee',
                            padding: '8px 15px',
                            position: 'relative',
                            overflow: 'visible',
                            marginBottom: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            width: 'fit-content',
                            margin: '0 auto 8px auto',
                          }}
                        >
                          {circleColors.map((field, index) => (
                            <div
                              key={field.key}
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                backgroundColor: preset[field.key] || '#cccccc',
                                border: '3px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                marginLeft: index > 0 ? '-12px' : '0',
                                zIndex: circleColors.length - index,
                                position: 'relative',
                              }}
                              title={field.label}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  No preset styles available
                </div>
              )}
            </div>
          </div>
        </SidebarPopup>
      </div>
    </FormFieldWrapper>
  );
};

export default ColorSchemaField;
