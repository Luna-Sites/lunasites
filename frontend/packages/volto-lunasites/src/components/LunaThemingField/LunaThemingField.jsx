import React from 'react';
import { FormFieldWrapper, Icon, SidebarPopup } from '@plone/volto/components';
import { Button, Header } from 'semantic-ui-react';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { getLunaTheming, setLunaTheming, applyLunaThemingPreset, clearLunaTheming } from '../../actions';
import { ModernColorPicker } from '../ColorPicker';

const LunaThemingField = (props) => {
  const { id, value, onChange } = props;
  const dispatch = useDispatch();

  const lunaTheming = useSelector((state) => state.lunaTheming);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [activeColorPicker, setActiveColorPicker] = React.useState(null);

  const mainColorFields = [
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

  // Load theming data on mount
  React.useEffect(() => {
    if (!lunaTheming?.get?.loaded && !lunaTheming?.get?.loading) {
      dispatch(getLunaTheming());
    }
  }, [dispatch, lunaTheming]);

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

  const handleColorChange = (field, color) => {
    const currentColors = lunaTheming?.data?.colors || {};
    const updatedColors = { ...currentColors, [field]: color };
    
    const updatedTheming = {
      ...lunaTheming.data,
      colors: updatedColors,
    };
    
    dispatch(setLunaTheming(updatedTheming));
    toast.success(`Updated ${field.replace('_', ' ')}`);
  };

  const applyPreset = (preset) => {
    dispatch(applyLunaThemingPreset(preset));
    toast.success(`Applied preset: ${preset.name}`);
  };

  const clearTheming = () => {
    dispatch(clearLunaTheming());
    toast.success('Reset to default theming');
  };

  const closeSidebar = React.useCallback(() => {
    setShowSidebar(false);
    if (activeColorPicker) {
      setActiveColorPicker(null);
    }
  }, [activeColorPicker]);

  const generateColorPreview = () => {
    const colors = lunaTheming?.data?.colors || {};
    const circleColors = mainColorFields.filter(
      (field) => field.key !== 'background_color',
    );
    const backgroundColor = colors.background_color || '#ffffff';

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
          setShowSidebar(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            setShowSidebar(true);
          }
        }}
        onMouseEnter={(e) => {
          const preview = e.currentTarget.querySelector('.current-theme-preview');
          if (preview) {
            preview.style.transform = 'scale(1.05)';
            preview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          const preview = e.currentTarget.querySelector('.current-theme-preview');
          if (preview) {
            preview.style.transform = 'scale(1)';
            preview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }
        }}
        aria-label="Open Luna theming editor"
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
                backgroundColor: colors[field.key] || '#cccccc',
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
          Luna Theme
        </div>
      </div>
    );
  };

  // Generate preset styles from the practical presets
  const generatePracticalPresets = () => [
    {
      name: 'Classic Blue',
      colors: {
        background_color: '#FFFFFF',
        neutral_color: '#1A1B20',
        primary_color: '#3A69F3',
        secondary_color: '#F0F0F2',
        tertiary_color: '#F7F8F8',
      }
    },
    {
      name: 'Coral Sunset',
      colors: {
        background_color: '#FFFFFF',
        neutral_color: '#020826',
        primary_color: '#F25042',
        secondary_color: '#EADDCF',
        tertiary_color: '#F9F4EF',
      }
    },
    {
      name: 'Forest Green',
      colors: {
        background_color: '#FFFFFF',
        neutral_color: '#34384F',
        primary_color: '#62BFAD',
        secondary_color: '#D0ECE6',
        tertiary_color: '#F9F7E8',
      }
    },
    {
      name: 'Royal Purple',
      colors: {
        background_color: '#FFFFFF',
        neutral_color: '#0D192A',
        primary_color: '#C757C9',
        secondary_color: '#F8B8DE',
        tertiary_color: '#F1EFE5',
      }
    },
    {
      name: 'Neon Mint',
      colors: {
        background_color: '#FFFFFF',
        neutral_color: '#000000',
        primary_color: '#28E8AE',
        secondary_color: '#6E29FF',
        tertiary_color: '#EDEDED',
      }
    },
    {
      name: 'Dark Mode',
      colors: {
        background_color: '#16161A',
        neutral_color: '#FFFFFF',
        primary_color: '#7F5AF0',
        secondary_color: '#2CB67D',
        tertiary_color: '#252733',
      }
    },
  ];

  return (
    <FormFieldWrapper {...props} className="luna-theming-field">
      <div style={{ width: '100%', maxWidth: '100%' }}>
        {/* Color Preview with Overlapping Circles */}
        {generateColorPreview()}

        {/* Sidebar with Luna Theming Editor */}
        <SidebarPopup open={showSidebar} onClose={closeSidebar}>
          <Header style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
            Luna Theming
            <button
              onClick={closeSidebar}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                marginLeft: '10px',
              }}
            >
              <Icon name={clearSVG} size="24px" title="Close" />
            </button>
            <button
              onClick={clearTheming}
              style={{
                float: 'right',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              <Icon name={rightArrowSVG} size="24px" title="Reset Theme" />
            </button>
          </Header>

          <div
            style={{
              padding: '20px',
              height: 'calc(100vh - 80px)',
              width: '350px',
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
                {mainColorFields.slice(0, 2).map((field) => {
                  const currentColor = lunaTheming?.data?.colors?.[field.key] || '#cccccc';
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
                        color: field.key === 'background_color'
                          ? lunaTheming?.data?.colors?.neutral_color || '#333'
                          : field.key === 'neutral_color'
                            ? lunaTheming?.data?.colors?.background_color || '#fff'
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
                        <div style={{ fontSize: '16px', fontWeight: '500', lineHeight: '1.2' }}>
                          {field.label}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '500' }}>
                        {currentColor.toUpperCase()}
                      </div>
                      
                      {/* Modern Color Picker */}
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
                {mainColorFields.slice(2, 5).map((field) => {
                  const currentColor = lunaTheming?.data?.colors?.[field.key] || '#cccccc';
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
                        color: field.key === 'primary_color'
                          ? lunaTheming?.data?.colors?.background_color || '#fff'
                          : lunaTheming?.data?.colors?.neutral_color || '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                      onClick={() => {
                        setActiveColorPicker(
                          activeColorPicker === field.key ? null : field.key
                        );
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.2' }}>
                          {field.label}
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '500' }}>
                        {currentColor.toUpperCase()}
                      </div>
                      
                      {/* Modern Color Picker */}
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  alignItems: 'center',
                }}
              >
                {generatePracticalPresets().map((preset) => {
                  const circleColors = mainColorFields.filter(
                    (field) => field.key !== 'background_color',
                  );
                  const backgroundColor = preset.colors.background_color || '#ffffff';

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
                      onClick={() => applyPreset(preset)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          applyPreset(preset);
                        }
                      }}
                      onMouseEnter={(e) => {
                        const preview = e.currentTarget.querySelector('.preset-preview');
                        if (preview) {
                          preview.style.transform = 'scale(1.05)';
                          preview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        const preview = e.currentTarget.querySelector('.preset-preview');
                        if (preview) {
                          preview.style.transform = 'scale(1)';
                          preview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }
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
                              backgroundColor: preset.colors[field.key] || '#cccccc',
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
            </div>
          </div>
        </SidebarPopup>
      </div>
    </FormFieldWrapper>
  );
};

export default LunaThemingField;