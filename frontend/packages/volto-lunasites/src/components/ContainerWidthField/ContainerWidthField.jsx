import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import SidebarPopup from '@plone/volto/components/manage/Sidebar/SidebarPopup';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import { setLunaTheming, getLunaTheming } from '../../actions';
import { toast } from 'react-toastify';

const ContainerWidthField = (props) => {
  const { id, value, onChange } = props;
  const dispatch = useDispatch();
  const lunaTheming = useSelector((state) => state.lunaTheming);
  const [showSidebar, setShowSidebar] = React.useState(false);

  const containerWidths = [
    {
      key: 'narrow',
      value: 'narrow',
      text: 'Narrow',
      description: 'Used for reading - 800px max width',
      width: '800px',
      preview: 'narrow',
    },
    {
      key: 'normal',
      value: 'normal',
      text: 'Normal',
      description: 'Standard container - 1200px max width',
      width: '1200px',
      preview: 'normal',
    },
    {
      key: 'wide',
      value: 'wide',
      text: 'Wide',
      description: 'Wide layout - 1400px max width',
      width: '1400px',
      preview: 'wide',
    },
    {
      key: 'full',
      value: 'full',
      text: 'Full Width',
      description: 'Full viewport width - 100vw',
      width: '100vw',
      preview: 'full',
    },
  ];

  const handleChange = async (newValue) => {
    // Update the form field value
    onChange(id, newValue);

    // Get current luna theming data from registry
    const currentData = lunaTheming?.data || {};

    // Update ONLY the container width, preserve everything else
    const updatedData = {
      ...currentData,
      container_width: newValue,
    };

    // Save to registry
    await dispatch(setLunaTheming(updatedData));

    // Refresh registry data
    dispatch(getLunaTheming());

    toast.success(`Container width changed to ${newValue}`);
  };

  // Get current value from registry if available
  const currentValue = value || lunaTheming?.data?.container_width || 'normal';

  const getCurrentWidth = () => {
    return (
      containerWidths.find((w) => w.value === currentValue) ||
      containerWidths[1]
    );
  };

  const generateContainerPreview = () => {
    const currentWidth = getCurrentWidth();

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
            '.current-container-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1.05)';
            preview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          const preview = e.currentTarget.querySelector(
            '.current-container-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1)';
            preview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }
        }}
        aria-label="Open container width editor"
      >
        <div
          className="current-container-preview"
          style={{
            width: '160px',
            height: '90px',
            background: '#f0f0f0',
            borderRadius: '6px',
            border: '2px solid #ddd',
            position: 'relative',
            margin: '0 auto 8px auto',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
          }}
        >
            {/* Browser top bar */}
            <div
              style={{
                height: '18px',
                background: '#e0e0e0',
                borderBottom: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '8px',
                gap: '4px',
              }}
            >
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#ff5f57',
                }}
              />
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#ffbd2e',
                }}
              />
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#28ca42',
                }}
              />
            </div>

            {/* Navbar */}
            <div
              style={{
                height: '16px',
                background: 'var(--lunasites-header-bg-color, #094ce1)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}
            />

            {/* Content area with background */}
            <div
              style={{
                height: 'calc(100% - 35px)',
                background: 'var(--lunasites-background-color, #ffffff)',
                padding: '6px',
                position: 'relative',
              }}
            >
              {/* Container representation */}
              <div
                style={{
                  height: '100%',
                  background: 'var(--lunasites-background-color, #ffffff)',
                  border: '1px dashed var(--lunasites-primary-color, #094ce1)',
                  borderRadius: '2px',
                  position: 'relative',
                  margin: '0 auto',
                  width:
                    currentWidth.value === 'narrow'
                      ? '45%'
                      : currentWidth.value === 'normal'
                        ? '65%'
                        : currentWidth.value === 'wide'
                          ? '80%'
                          : '100%',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Width label */}
                <div
                  style={{
                    fontSize: '8px',
                    fontWeight: '700',
                    color: 'var(--lunasites-primary-color, #094ce1)',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  }}
                >
                  {currentWidth.text}
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  };

  return (
    <FormFieldWrapper {...props} className="container-width-field">
      <div style={{ width: '100%', maxWidth: '100%' }}>
        {generateContainerPreview()}

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
              Container Width Settings
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
            <div className="container-widths-grid">
              {containerWidths.map((width) => (
                <div
                  key={width.key}
                  className={`container-width-card ${
                    currentValue === width.value ? 'selected' : ''
                  }`}
                  onClick={() => handleChange(width.value)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleChange(width.value);
                    }
                  }}
                >
                  <div className="width-preview">
                    {/* Browser representation */}
                    <div
                      style={{
                        width: '140px',
                        height: '80px',
                        background: '#f0f0f0',
                        borderRadius: '6px',
                        border: '2px solid #ddd',
                        position: 'relative',
                        margin: '0 auto',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Browser top bar */}
                      <div
                        style={{
                          height: '16px',
                          background: '#e0e0e0',
                          borderBottom: '1px solid #ccc',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '6px',
                          gap: '3px',
                        }}
                      >
                        <div
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#ff5f57',
                          }}
                        />
                        <div
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#ffbd2e',
                          }}
                        />
                        <div
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#28ca42',
                          }}
                        />
                      </div>

                      {/* Navbar */}
                      <div
                        style={{
                          height: '14px',
                          background: 'var(--lunasites-header-bg-color, #094ce1)',
                          borderBottom: '1px solid rgba(0,0,0,0.1)',
                        }}
                      />

                      {/* Content area with background */}
                      <div
                        style={{
                          height: 'calc(100% - 31px)',
                          background: 'var(--lunasites-background-color, #ffffff)',
                          padding: '4px',
                          position: 'relative',
                        }}
                      >
                        {/* Container representation */}
                        <div
                          style={{
                            height: '100%',
                            background: 'var(--lunasites-background-color, #ffffff)',
                            border: '1px dashed var(--lunasites-primary-color, #094ce1)',
                            borderRadius: '2px',
                            position: 'relative',
                            margin: '0 auto',
                            width:
                              width.value === 'narrow'
                                ? '50%'
                                : width.value === 'normal'
                                  ? '70%'
                                  : width.value === 'wide'
                                    ? '85%'
                                    : '100%',
                            transition: 'width 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {/* Width label */}
                          <div
                            style={{
                              fontSize: '7px',
                              fontWeight: '700',
                              color: 'var(--lunasites-primary-color, #094ce1)',
                              textAlign: 'center',
                              lineHeight: '1.2',
                            }}
                          >
                            {width.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="width-info">
                    <h4>{width.text}</h4>
                    <p>{width.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SidebarPopup>
      </div>

      <style jsx>{`
        .container-widths-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 12px;
        }

        .container-width-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.3s ease;
          background: white;
        }

        .container-width-card:hover {
          border-color: #094ce1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .container-width-card.selected {
          border-color: #094ce1;
          background: #f0f2ff;
        }

        .width-preview {
          margin-bottom: 12px;
          padding: 16px;
          border-radius: 4px;
          background: #f8f9fa;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .width-info h4 {
          margin: 0 0 6px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .width-info p {
          margin: 0;
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }
      `}</style>
    </FormFieldWrapper>
  );
};

export default ContainerWidthField;
