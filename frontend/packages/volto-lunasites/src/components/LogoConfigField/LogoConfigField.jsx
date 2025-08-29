import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import SidebarPopup from '@plone/volto/components/manage/Sidebar/SidebarPopup';
import { Button } from 'semantic-ui-react';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import uploadSVG from '@plone/volto/icons/upload.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import { setLunaTheming, getLunaTheming } from '../../actions';
import { toast } from 'react-toastify';
import { serializeNodesToText } from '@plone/volto-slate/editor/render';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import isUndefined from 'lodash/isUndefined';
import isString from 'lodash/isString';
import debounce from 'lodash/debounce';
import SlateEditor from '@plone/volto-slate/editor/SlateEditor';
import { handleKeyDetached } from '@plone/volto-slate/blocks/Text/keyboard';
import {
  createEmptyParagraph,
  createParagraph,
} from '@plone/volto-slate/utils/blocks';
import config from '@plone/volto/registry';
import RichTextWidgetView from '@plone/volto-slate/widgets/RichTextWidgetView';

const getValue = (value) => {
  if (isUndefined(value) || !isUndefined(value?.data)) {
    return [createEmptyParagraph()];
  }
  if (isString(value)) {
    return [createParagraph(value)];
  }
  return value;
};

const LogoConfigField = (props) => {
  const { id, title, description, value, onChange } = props;
  const dispatch = useDispatch();
  const lunaTheming = useSelector((state) => state.lunaTheming);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [selected, setSelected] = React.useState(false);

  // Logo layout options
  const logoLayouts = [
    {
      key: 'horizontal',
      value: 'horizontal',
      text: 'Horizontal Layout',
      description: 'Logo and text side by side',
      preview: 'horizontal',
    },
    {
      key: 'vertical',
      value: 'vertical',
      text: 'Vertical Layout',
      description: 'Logo on top, text below',
      preview: 'vertical',
    },
    {
      key: 'logo_only',
      value: 'logo_only',
      text: 'Logo Only',
      description: 'Show only logo image',
      preview: 'logo-only',
    },
    {
      key: 'text_only',
      value: 'text_only',
      text: 'Text Only',
      description: 'Show only text',
      preview: 'text-only',
    },
  ];

  // Get current config
  const getCurrentConfig = () => {
    return value || lunaTheming?.data?.logo_config || {};
  };

  const handleChange = async (newConfig) => {
    console.log('LogoConfigField handleChange called with:', newConfig);

    // Update the form field value
    onChange(id, newConfig);

    // Get current luna theming data from registry
    const currentData = lunaTheming?.data || {};
    console.log('Current luna theming data:', currentData);

    // Update ONLY the logo config section, preserve everything else
    const updatedData = {
      ...currentData,
      logo_config: newConfig,
    };

    console.log('Sending updated data to registry:', updatedData);

    // Save to registry
    const result = await dispatch(setLunaTheming(updatedData));
    console.log('setLunaTheming result:', result);

    // Refresh registry data
    dispatch(getLunaTheming());
  };

  // Debounced version for text changes
  const debouncedHandleChange = React.useMemo(
    () => debounce(handleChange, 500),
    [handleChange],
  );

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        const config = getCurrentConfig();

        const newConfig = {
          ...config,
          image: imageData,
        };

        handleChange(newConfig);
        toast.success('Logo image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (fieldId, value) => {
    const config = getCurrentConfig();

    const newConfig = {
      ...config,
      text: value,
    };

    debouncedHandleChange(newConfig);
  };

  const handleLayoutChange = (layout) => {
    const config = getCurrentConfig();

    const newConfig = {
      ...config,
      layout: layout,
    };

    handleChange(newConfig);
    toast.success(`Layout changed to ${layout}`);
  };

  const clearLogo = () => {
    const config = getCurrentConfig();

    const newConfig = {
      ...config,
      image: null,
    };

    handleChange(newConfig);
    toast.success('Logo image removed');
  };

  const generateLogoPreview = () => {
    const config = getCurrentConfig();
    const hasImage = config.image;
    const hasText =
      config.text &&
      (typeof config.text === 'string'
        ? config.text.length > 0
        : config.text && serializeNodesToText(config.text)?.trim() !== '');
    const layout = config.layout || 'horizontal';

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
          const preview = e.currentTarget.querySelector(
            '.current-logo-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1.05)';
            preview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          const preview = e.currentTarget.querySelector(
            '.current-logo-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1)';
            preview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }
        }}
        aria-label="Open logo configuration editor"
      >
        <div
          className="current-logo-preview"
          style={{
            borderRadius: '8px',
            border: '2px solid #eee',
            padding: '15px 20px',
            marginBottom: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: 'fit-content',
            margin: '0 auto 8px auto',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: layout === 'vertical' ? 'column' : 'row',
            gap: layout === 'horizontal' ? '12px' : '8px',
            background: 'var(--lunasites-header-bg-color, #f8f9fa)',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          {!hasImage && !hasText && (
            <div
              style={{
                color: '#999',
                fontSize: '14px',
                fontStyle: 'italic',
              }}
            >
              No logo configured
            </div>
          )}

          {(layout === 'logo_only' ||
            layout === 'horizontal' ||
            layout === 'vertical') &&
            hasImage && (
              <img
                src={
                  typeof config.image === 'string'
                    ? config.image
                    : flattenToAppURL(config.image)
                }
                alt="Logo preview"
                style={{
                  maxHeight: '40px',
                  maxWidth: '120px',
                  objectFit: 'contain',
                }}
              />
            )}

          {(layout === 'text_only' ||
            layout === 'horizontal' ||
            layout === 'vertical') &&
            hasText && (
              <div
                className="main-preview-text"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--lunasites-header-text-color, #374151)',
                }}
              >
                {typeof config.text === 'string'
                  ? config.text
                  : config.text && <RichTextWidgetView value={config.text} />}
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <FormFieldWrapper {...props} className="logo-config-field">
      <div style={{ width: '100%', maxWidth: '100%' }}>
        {generateLogoPreview()}

        <SidebarPopup open={showSidebar} onClose={() => setShowSidebar(false)}>
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Logo Configuration
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={rightArrowSVG} size="18px" title="Close" />
            </button>
          </div>

          <div
            style={{
              padding: '20px',
              height: 'calc(100vh - 80px)',
              width: '100%',
              overflowY: 'auto',
            }}
          >
            {/* Logo Image Upload */}
            <div style={{ marginBottom: '30px' }}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '15px',
                }}
              >
                Logo Image
              </h3>

              {getCurrentConfig().image && (
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '15px',
                    padding: '15px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                  }}
                >
                  <img
                    src={getCurrentConfig().image}
                    alt="Current logo"
                    style={{
                      maxHeight: '80px',
                      maxWidth: '200px',
                      objectFit: 'contain',
                      marginBottom: '10px',
                    }}
                  />
                  <div>
                    <Button
                      size="small"
                      color="red"
                      onClick={clearLogo}
                      style={{ marginTop: '8px' }}
                    >
                      <Icon name={clearSVG} size="14px" />
                      Remove Logo
                    </Button>
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#007bc7',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#005a8b';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#007bc7';
                  }}
                >
                  <Icon name={uploadSVG} size="16px" />
                  {getCurrentConfig().image ? 'Change Logo' : 'Upload Logo'}
                </label>
              </div>
            </div>

            {/* Logo Text */}
            <div style={{ marginBottom: '30px' }}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '15px',
                }}
              >
                Logo Text
              </h3>
              <div
                className="slate_wysiwyg"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div
                  className="slate_wysiwyg_box"
                  role="textbox"
                  tabIndex="-1"
                  style={{
                    boxSizing: 'initial',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(true);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <SlateEditor
                    readOnly={false}
                    id="logo-text-editor"
                    name="logo-text-editor"
                    value={getValue(getCurrentConfig().text)}
                    onChange={(newValue) => {
                      // Validate the new value to prevent path errors
                      if (Array.isArray(newValue) && newValue.length > 0) {
                        handleTextChange('text', newValue);
                      }
                    }}
                    selected={selected}
                    showToolbar={true}
                    toolbarAlwaysVisible={false}
                    extensions={config.settings.slate.slateWidgetExtensions}
                    onKeyDown={(event, editor) => {
                      // Handle Enter key safely
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        // Insert a simple line break instead of creating new blocks
                        editor.insertText('\n');
                        return;
                      }
                      // Use default handling for other keys
                      if (handleKeyDetached) {
                        handleKeyDetached(event, editor);
                      }
                    }}
                    placeholder="Enter site name or logo text"
                    editableProps={{
                      'aria-multiline': 'true',
                      onMouseDown: (e) => e.stopPropagation(),
                      onClick: (e) => e.stopPropagation(),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Layout Options */}
            <div style={{ marginBottom: '30px' }}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '15px',
                }}
              >
                Layout Options
              </h3>

              <div className="logo-layouts-grid">
                {logoLayouts.map((layout) => {
                  const config = getCurrentConfig();
                  const currentLayout = config.layout || 'horizontal';

                  return (
                    <div
                      key={layout.key}
                      className={`logo-layout-card ${
                        currentLayout === layout.value ? 'selected' : ''
                      }`}
                      onClick={() => handleLayoutChange(layout.value)}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleLayoutChange(layout.value);
                        }
                      }}
                    >
                      <div className="layout-preview">
                        <div className={`preview-${layout.preview}`}>
                          {(layout.value === 'logo_only' ||
                            layout.value === 'horizontal' ||
                            layout.value === 'vertical') &&
                            config.image && (
                              <img
                                src={
                                  typeof config.image === 'string'
                                    ? config.image
                                    : flattenToAppURL(config.image)
                                }
                                alt="Logo preview"
                                className="preview-logo-img"
                                style={{
                                  maxHeight: '24px',
                                  maxWidth: '60px',
                                  objectFit: 'contain',
                                }}
                              />
                            )}
                          {(layout.value === 'logo_only' ||
                            layout.value === 'horizontal' ||
                            layout.value === 'vertical') &&
                            !config.image && (
                              <div className="preview-logo">🖼️</div>
                            )}
                          {(layout.value === 'text_only' ||
                            layout.value === 'horizontal' ||
                            layout.value === 'vertical') &&
                            config.text && (
                              <div className="preview-text">
                                {typeof config.text === 'string'
                                  ? config.text
                                  : config.text && (
                                      <RichTextWidgetView value={config.text} />
                                    )}
                              </div>
                            )}
                          {(layout.value === 'text_only' ||
                            layout.value === 'horizontal' ||
                            layout.value === 'vertical') &&
                            !config.text && (
                              <div className="preview-text">Site Name</div>
                            )}
                        </div>
                      </div>

                      <div className="layout-info">
                        <h4>{layout.text}</h4>
                        <p>{layout.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SidebarPopup>
      </div>

      <style jsx>{`
        .slate_wysiwyg {
          position: relative;
          z-index: 1000;
        }

        .slate_wysiwyg .slate-editor {
          position: relative;
        }

        .slate_wysiwyg .slate-editor .slate-editor-toolbar {
          position: relative !important;
          z-index: 1001;
        }

        .slate_wysiwyg .slate-editor .slate-inline-toolbar {
          z-index: 1002 !important;
        }

        .slate_wysiwyg .slate-editor .slate-toolbar {
          z-index: 1002 !important;
        }

        .slate_wysiwyg * {
          pointer-events: auto;
        }

        .logo-layouts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-top: 12px;
        }

        .logo-layout-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s ease;
          background: white;
        }

        .logo-layout-card:hover {
          border-color: #094ce1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .logo-layout-card.selected {
          border-color: #094ce1;
          background: #f0f2ff;
        }

        .layout-preview {
          margin-bottom: 8px;
          padding: 12px;
          border-radius: 4px;
          background: var(--lunasites-header-bg-color, #f8f9fa);
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .preview-horizontal {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .preview-vertical {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .preview-logo-only {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-text-only {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-logo {
          font-size: 20px;
        }

        .preview-text {
          font-size: 12px;
          font-weight: 600;
          color: var(--lunasites-header-text-color, #374151);
          line-height: 1.2;
          min-height: 0;
        }

        .preview-text .slate.widget {
          font-size: 12px !important;
          line-height: 1.2 !important;
          min-height: 0;
        }

        .preview-text .slate.widget p {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 12px !important;
          line-height: 1.2 !important;
          min-height: 0;
        }

        .preview-text .slate.widget * {
          font-size: 12px !important;
          line-height: 1.2 !important;
          min-height: 0;
        }

        .main-preview-text {
          line-height: 1.3 !important;
        }

        .main-preview-text .slate.widget {
          font-size: 16px !important;
          line-height: 1.3 !important;
        }

        .main-preview-text .slate.widget p {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 16px !important;
          line-height: 1.3 !important;
        }

        .main-preview-text .slate.widget * {
          font-size: 16px !important;
          line-height: 1.3 !important;
        }

        .slate.widget p {
          margin: 0 0 0.2em 0 !important;
          line-height: 1.2 !important;
        }

        .main-preview-text .slate.widget p {
          margin: 0 0 0.3em 0 !important;
          line-height: 1.3 !important;
        }

        .preview-text .slate.widget p {
          margin: 0 0 0.1em 0 !important;
          line-height: 1.2 !important;
        }

        .layout-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .layout-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
      `}</style>
    </FormFieldWrapper>
  );
};

export default LogoConfigField;
