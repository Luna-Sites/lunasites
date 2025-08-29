import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import SidebarPopup from '@plone/volto/components/manage/Sidebar/SidebarPopup';
import { Button } from 'semantic-ui-react';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import { setLunaTheming, getLunaTheming } from '../../../actions';

const HeaderVariationField = (props) => {
  const { id, title, description, value, onChange } = props;
  const dispatch = useDispatch();
  const lunaTheming = useSelector((state) => state.lunaTheming);
  const [showSidebar, setShowSidebar] = React.useState(false);

  const headerVariations = [
    {
      key: 'primary_navigation',
      value: 'primary_navigation',
      text: 'Primary Navigation',
      description: 'Primary background with tertiary text',
      headerBg: 'primary_color',
      headerText: 'tertiary_color',
      dropdownBg: 'neutral_color',
      dropdownText: 'tertiary_color',
    },
    {
      key: 'neutral_navigation',
      value: 'neutral_navigation',
      text: 'Neutral Navigation',
      description: 'Neutral background with tertiary text',
      headerBg: 'neutral_color',
      headerText: 'tertiary_color',
      dropdownBg: 'background_color',
      dropdownText: 'neutral_color',
    },
    {
      key: 'light_background_navigation',
      value: 'light_background_navigation',
      text: 'Light Background',
      description: 'Light background with neutral text',
      headerBg: 'background_color',
      headerText: 'neutral_color',
      dropdownBg: 'tertiary_color',
      dropdownText: 'neutral_color',
    },
    {
      key: 'secondary_accent_navigation',
      value: 'secondary_accent_navigation',
      text: 'Secondary Accent',
      description: 'Secondary background with tertiary text',
      headerBg: 'secondary_color',
      headerText: 'tertiary_color',
      dropdownBg: 'primary_color',
      dropdownText: 'tertiary_color',
    },
    {
      key: 'minimal_white_navigation',
      value: 'minimal_white_navigation',
      text: 'Minimal White',
      description: 'Tertiary background with neutral text',
      headerBg: 'tertiary_color',
      headerText: 'neutral_color',
      dropdownBg: 'primary_color',
      dropdownText: 'tertiary_color',
    },
    {
      key: 'inverted_neutral_navigation',
      value: 'inverted_neutral_navigation',
      text: 'Inverted Neutral',
      description: 'Dark neutral with light text',
      headerBg: 'neutral_color',
      headerText: 'background_color',
      dropdownBg: 'tertiary_color',
      dropdownText: 'neutral_color',
    },
  ];

  const handleChange = async (event, data) => {
    const selectedVariation = data.value;

    // Update the form field value
    onChange(id, selectedVariation);

    // Get current luna theming data from registry
    const currentData = lunaTheming?.data || {};
    // console.log('change', lunaTheming);
    // Update ONLY the header section, preserve everything else (colors, fonts, buttons)
    const updatedData = {
      ...currentData,
      header: {
        variation: selectedVariation,
      },
    };

    // console.log('HeaderVariationField: Saving updated data:', updatedData);

    // Save to registry
    await dispatch(setLunaTheming(updatedData));

    // Refresh registry data
    dispatch(getLunaTheming());
  };

  // Get current value from registry if available
  const currentValue =
    value ||
    lunaTheming?.data?.luna_theming?.header?.variation ||
    'primary_navigation';

  const colors = lunaTheming?.data?.colors || {};

  const getColorValue = (colorKey) => {
    return colors[colorKey] || '#666666';
  };

  const handleCardClick = (variation) => {
    const event = { target: { value: variation.value } };
    handleChange(event, { value: variation.value });
    setShowSidebar(false);
  };

  const getCurrentVariation = () => {
    return (
      headerVariations.find((v) => v.value === currentValue) ||
      headerVariations[0]
    );
  };

  const generateHeaderPreview = () => {
    const currentVariation = getCurrentVariation();

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
            '.current-header-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1.05)';
            preview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          const preview = e.currentTarget.querySelector(
            '.current-header-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1)';
            preview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }
        }}
        aria-label="Open header variation editor"
      >
        {/* Header and Dropdown Preview */}
        <div
          className="current-header-preview"
          style={{
            borderRadius: '8px',
            border: '2px solid #eee',
            overflow: 'hidden',
            marginBottom: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: 'fit-content',
            margin: '0 auto 8px auto',
          }}
        >
          {/* Header preview */}
          <div
            style={{
              backgroundColor: getColorValue(currentVariation.headerBg),
              color: getColorValue(currentVariation.headerText),
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {currentVariation.text}
          </div>

          {/* Dropdown preview */}
          <div
            style={{
              backgroundColor: getColorValue(currentVariation.dropdownBg),
              color: getColorValue(currentVariation.dropdownText),
              padding: '8px 20px',
              fontSize: '12px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Dropdown Menu
          </div>
        </div>

        {/* Button text */}
      </div>
    );
  };

  return (
    <FormFieldWrapper {...props} className="header-variation-field">
      <div style={{ width: '100%', maxWidth: '100%' }}>
        {/* Header Preview with button */}
        {generateHeaderPreview()}

        {/* Sidebar with Header Variations */}
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
              Header Navigation Styles
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
            <div className="header-variations-grid">
              {headerVariations.map((variation) => (
                <div
                  key={variation.key}
                  className={`header-variation-card ${
                    currentValue === variation.value ? 'selected' : ''
                  }`}
                  onClick={() => handleCardClick(variation)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCardClick(variation);
                    }
                  }}
                >
                  <div className="variation-preview">
                    {/* Header preview */}
                    <div
                      className="preview-header"
                      style={{
                        backgroundColor: getColorValue(variation.headerBg),
                        color: getColorValue(variation.headerText),
                        padding: '8px 12px',
                        fontSize: '12px',
                        borderRadius: '4px 4px 0 0',
                      }}
                    >
                      Header
                    </div>

                    {/* Dropdown preview */}
                    <div
                      className="preview-dropdown"
                      style={{
                        backgroundColor: getColorValue(variation.dropdownBg),
                        color: getColorValue(variation.dropdownText),
                        padding: '6px 12px',
                        fontSize: '10px',
                        borderRadius: '0 0 4px 4px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      Menu
                    </div>
                  </div>

                  <div className="variation-info">
                    <h4>{variation.text}</h4>
                    <p>{variation.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SidebarPopup>
      </div>

      <style jsx>{`
        .header-variations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 12px;
        }

        .header-variation-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s ease;
          background: white;
        }

        .header-variation-card:hover {
          border-color: #094ce1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .header-variation-card.selected {
          border-color: #094ce1;
          background: #f0f2ff;
        }

        .variation-preview {
          margin-bottom: 8px;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .variation-info h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .variation-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }

        .field-description {
          margin-bottom: 8px;
          font-size: 13px;
          color: #666;
        }
      `}</style>
    </FormFieldWrapper>
  );
};

export default HeaderVariationField;
