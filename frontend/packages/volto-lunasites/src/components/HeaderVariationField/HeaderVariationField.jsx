import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLunaTheming, getLunaTheming } from '../../actions';

const HeaderVariationField = (props) => {
  const { id, title, description, value, onChange } = props;
  const dispatch = useDispatch();
  const lunaTheming = useSelector((state) => state.lunaTheming);

  const headerVariations = [
    {
      key: 'primary_navigation',
      value: 'primary_navigation',
      text: 'Primary Navigation',
      description: 'Primary background with tertiary text',
      headerBg: 'primary_color',
      headerText: 'tertiary_color',
      dropdownBg: 'neutral_color',
      dropdownText: 'tertiary_color'
    },
    {
      key: 'neutral_navigation',
      value: 'neutral_navigation',
      text: 'Neutral Navigation',
      description: 'Neutral background with tertiary text',
      headerBg: 'neutral_color',
      headerText: 'tertiary_color',
      dropdownBg: 'background_color',
      dropdownText: 'neutral_color'
    },
    {
      key: 'light_background_navigation',
      value: 'light_background_navigation',
      text: 'Light Background',
      description: 'Light background with neutral text',
      headerBg: 'background_color',
      headerText: 'neutral_color',
      dropdownBg: 'tertiary_color',
      dropdownText: 'neutral_color'
    },
    {
      key: 'secondary_accent_navigation',
      value: 'secondary_accent_navigation',
      text: 'Secondary Accent',
      description: 'Secondary background with tertiary text',
      headerBg: 'secondary_color',
      headerText: 'tertiary_color',
      dropdownBg: 'primary_color',
      dropdownText: 'tertiary_color'
    },
    {
      key: 'minimal_white_navigation',
      value: 'minimal_white_navigation',
      text: 'Minimal White',
      description: 'Tertiary background with neutral text',
      headerBg: 'tertiary_color',
      headerText: 'neutral_color',
      dropdownBg: 'primary_color',
      dropdownText: 'tertiary_color'
    },
    {
      key: 'inverted_neutral_navigation',
      value: 'inverted_neutral_navigation',
      text: 'Inverted Neutral',
      description: 'Dark neutral with light text',
      headerBg: 'neutral_color',
      headerText: 'background_color',
      dropdownBg: 'tertiary_color',
      dropdownText: 'neutral_color'
    },
  ];

  const handleChange = async (event, data) => {
    const selectedVariation = data.value;

    // Update the form field value
    onChange(id, selectedVariation);

    // Get current luna theming data from registry
    const currentData = lunaTheming?.data || {};
    console.log('change', lunaTheming);
    // Update ONLY the header section, preserve everything else (colors, fonts, buttons)
    const updatedData = {
      ...currentData,
      header: {
        variation: selectedVariation,
      },
    };

    console.log('HeaderVariationField: Saving updated data:', updatedData);

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
  };

  return (
    <div className="header-variation-field">
      <label htmlFor={id}>{title}</label>
      {description && <div className="field-description">{description}</div>}
      
      <div className="header-variations-grid">
        {headerVariations.map((variation) => (
          <div
            key={variation.key}
            className={`header-variation-card ${
              currentValue === variation.value ? 'selected' : ''
            }`}
            onClick={() => handleCardClick(variation)}
            style={{ cursor: 'pointer' }}
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
                  borderRadius: '4px 4px 0 0'
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
                  borderTop: '1px solid rgba(255,255,255,0.1)'
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
    </div>
  );
};

export default HeaderVariationField;
