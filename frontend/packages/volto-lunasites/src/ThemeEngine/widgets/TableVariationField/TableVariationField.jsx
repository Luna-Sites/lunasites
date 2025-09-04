import React from 'react';
import { useSelector } from 'react-redux';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import SidebarPopup from '@plone/volto/components/manage/Sidebar/SidebarPopup';
import { Button } from 'semantic-ui-react';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import './TableVariationField.scss';

const TableVariationField = (props) => {
  const { id, title, description, value, onChange } = props;
  const lunaTheming = useSelector((state) => state.lunaTheming);
  const [showSidebar, setShowSidebar] = React.useState(false);

  // Get colors from global theme
  const colors = lunaTheming?.data?.colors || {};
  const getColorValue = (colorKey) => {
    if (colorKey === 'transparent') return 'transparent';
    return colors[colorKey] || '#666666';
  };

  const tableVariations = [
    {
      key: 'primary_table',
      name: 'Primary',
      headerBg: 'primary_color',
      headerText: 'tertiary_color',
      cellBg: 'background_color',
      cellText: 'neutral_color',
      borderColor: 'primary_color',
    },
    {
      key: 'neutral_table',
      name: 'Neutral',
      headerBg: 'neutral_color',
      headerText: 'tertiary_color',
      cellBg: 'background_color',
      cellText: 'neutral_color',
      borderColor: 'neutral_color',
    },
    {
      key: 'minimal_table',
      name: 'Minimal',
      headerBg: 'background_color',
      headerText: 'neutral_color',
      cellBg: 'background_color',
      cellText: 'neutral_color',
      borderColor: 'neutral_color',
    },
    {
      key: 'secondary_table',
      name: 'Secondary',
      headerBg: 'secondary_color',
      headerText: 'tertiary_color',
      cellBg: 'background_color',
      cellText: 'neutral_color',
      borderColor: 'secondary_color',
    },
  ];

  const handleVariationChange = (variationKey) => {
    onChange(id, variationKey);
    setShowSidebar(false);
  };

  const selectedVariation =
    tableVariations.find((v) => v.key === value) || tableVariations[0];

  return (
    <FormFieldWrapper {...props}>
      <div
        className="header-variation-button"
        onClick={() => setShowSidebar(true)}
      >
        <div className="table-variation-preview">
          <div
            className="table-variation-header"
            style={{
              backgroundColor: getColorValue(selectedVariation.headerBg),
              color: getColorValue(selectedVariation.headerText),
              borderColor: getColorValue(selectedVariation.borderColor),
            }}
          >
            Header
          </div>
          <div
            className="table-variation-cell"
            style={{
              backgroundColor: getColorValue(selectedVariation.cellBg),
              color: getColorValue(selectedVariation.cellText),
              borderColor: getColorValue(selectedVariation.borderColor),
            }}
          >
            Cell
          </div>
        </div>
        <Icon name={rightArrowSVG} size="18px" />
      </div>

      <SidebarPopup open={showSidebar} onClose={() => setShowSidebar(false)}>
        <div className="table-variation-popup">
          <h3>Table Theme</h3>
          <div className="table-variation-grid">
            {tableVariations.map((variation) => (
              <div
                key={variation.key}
                className={`table-variation-option ${
                  value === variation.key ? 'selected' : ''
                }`}
                onClick={() => handleVariationChange(variation.key)}
                style={{ width: '100%' }}
              >
                <div className="table-variation-preview">
                  <div
                    className="table-variation-header"
                    style={{
                      backgroundColor: getColorValue(variation.headerBg),
                      color: getColorValue(variation.headerText),
                      borderColor: getColorValue(variation.borderColor),
                      width: '100%',
                    }}
                  >
                    Header
                  </div>
                  <div
                    className="table-variation-cell"
                    style={{
                      backgroundColor: getColorValue(variation.cellBg),
                      color: getColorValue(variation.cellText),
                      borderColor: getColorValue(variation.borderColor),
                    }}
                  >
                    Cell
                  </div>
                </div>
                <span className="table-variation-name">{variation.name}</span>
              </div>
            ))}
          </div>
        </div>
      </SidebarPopup>
    </FormFieldWrapper>
  );
};

export default TableVariationField;
