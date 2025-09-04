import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import SidebarPopup from '@plone/volto/components/manage/Sidebar/SidebarPopup';
import { Button } from 'semantic-ui-react';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import { setLunaTheming, getLunaTheming } from '../../../actions';

const AccordionVariationField = (props) => {
  const { id, title, description, value, onChange } = props;
  const dispatch = useDispatch();
  const lunaTheming = useSelector((state) => state.lunaTheming);
  const [showSidebar, setShowSidebar] = React.useState(false);

  const accordionVariations = [
    {
      key: 'primary_accordion',
      value: 'primary_accordion',
      text: 'Primary Accordion',
      description: 'Primary background with tertiary text',
      titleBg: 'primary_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: 'none',
    },
    {
      key: 'neutral_accordion',
      value: 'neutral_accordion', 
      text: 'Neutral Accordion',
      description: 'Neutral background with clean borders',
      titleBg: 'neutral_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: '1px solid #e1e5e9',
    },
    {
      key: 'minimal_accordion',
      value: 'minimal_accordion',
      text: 'Minimal Accordion',
      description: 'Clean transparent with subtle borders',
      titleBg: 'transparent',
      titleText: 'neutral_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: '1px solid #f1f3f5',
    },
    {
      key: 'inverted_accordion',
      value: 'inverted_accordion',
      text: 'Inverted Accordion',
      description: 'Dark theme with light text',
      titleBg: 'neutral_color',
      titleText: 'background_color',
      contentBg: 'transparent',
      contentText: 'neutral_color',
      border: 'none',
    },
    {
      key: 'secondary_accent_accordion',
      value: 'secondary_accent_accordion',
      text: 'Secondary Accent',
      description: 'Secondary color with accent styling',
      titleBg: 'secondary_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: 'none',
    },
    {
      key: 'soft_bordered_accordion',
      value: 'soft_bordered_accordion',
      text: 'Soft Bordered',
      description: 'Light background with subtle borders',
      titleBg: 'background_color',
      titleText: 'neutral_color',
      contentBg: 'tertiary_color',
      contentText: 'neutral_color',
      border: '1px solid #e1e5e9',
    },
  ];

  const handleChange = (event, data) => {
    const selectedVariation = data.value;

    // Update the form field value directly
    onChange(id, selectedVariation);
  };

  // Get current value from props
  const currentValue = value || 'primary_accordion';

  const colors = lunaTheming?.data?.colors || {};

  const getColorValue = (colorKey) => {
    if (colorKey === 'transparent') return 'transparent';
    return colors[colorKey] || '#666666';
  };

  const handleCardClick = (variation) => {
    const event = { target: { value: variation.value } };
    handleChange(event, { value: variation.value });
    setShowSidebar(false);
  };

  const getCurrentVariation = () => {
    return (
      accordionVariations.find((v) => v.value === currentValue) ||
      accordionVariations[0]
    );
  };

  const generateAccordionPreview = () => {
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
            '.current-accordion-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1.05)';
            preview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          const preview = e.currentTarget.querySelector(
            '.current-accordion-preview',
          );
          if (preview) {
            preview.style.transform = 'scale(1)';
            preview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }
        }}
        aria-label="Open accordion variation editor"
      >
        {/* Accordion Preview */}
        <div
          className="current-accordion-preview"
          style={{
            borderRadius: '8px',
            border: currentVariation.border || '2px solid #eee',
            overflow: 'hidden',
            marginBottom: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: 'fit-content',
            margin: '0 auto 8px auto',
            minWidth: '200px',
          }}
        >
          {/* Accordion Title preview */}
          <div
            style={{
              backgroundColor: getColorValue(currentVariation.titleBg),
              color: getColorValue(currentVariation.titleText),
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{currentVariation.text}</span>
            <span style={{ fontSize: '12px' }}>▼</span>
          </div>

          {/* Accordion Content preview */}
          <div
            style={{
              backgroundColor: getColorValue(currentVariation.contentBg),
              color: getColorValue(currentVariation.contentText),
              padding: '12px 20px',
              fontSize: '12px',
              borderTop: currentVariation.titleBg === 'transparent' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Accordion content area
          </div>
        </div>
      </div>
    );
  };

  return (
    <FormFieldWrapper {...props} className="accordion-variation-field">
      <div style={{ width: '100%', maxWidth: '100%' }}>
        {/* Accordion Preview with button */}
        {generateAccordionPreview()}

        {/* Sidebar with Accordion Variations */}
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
              Accordion Styles
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
            <div className="accordion-variations-grid">
              {accordionVariations.map((variation) => (
                <div
                  key={variation.key}
                  className={`accordion-variation-card ${
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
                    {/* Accordion Title preview */}
                    <div
                      className="preview-title"
                      style={{
                        backgroundColor: getColorValue(variation.titleBg),
                        color: getColorValue(variation.titleText),
                        padding: '10px 12px',
                        fontSize: '12px',
                        borderRadius: '4px 4px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: variation.border,
                        borderBottom: 'none',
                      }}
                    >
                      <span>Title</span>
                      <span style={{ fontSize: '10px' }}>▼</span>
                    </div>

                    {/* Accordion Content preview */}
                    <div
                      className="preview-content"
                      style={{
                        backgroundColor: getColorValue(variation.contentBg),
                        color: getColorValue(variation.contentText),
                        padding: '8px 12px',
                        fontSize: '10px',
                        borderRadius: '0 0 4px 4px',
                        border: variation.border,
                        borderTop: variation.titleBg === 'transparent' ? variation.border : '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      Content
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
        .accordion-variations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 12px;
        }

        .accordion-variation-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          transition: all 0.3s ease;
          background: white;
        }

        .accordion-variation-card:hover {
          border-color: #094ce1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .accordion-variation-card.selected {
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

export default AccordionVariationField;