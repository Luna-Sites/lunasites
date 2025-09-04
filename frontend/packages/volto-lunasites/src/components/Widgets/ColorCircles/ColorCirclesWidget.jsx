import React from 'react';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import './ColorCirclesWidget.scss';

const ColorCirclesWidget = (props) => {
  const { id, title, required, value, onChange, choices = [] } = props;
  const lunaTheming = useSelector((state) => state.lunaTheming);
  
  // Get colors from global theme
  const colors = lunaTheming?.data?.colors || {};
  const getColorValue = (colorKey) => colors[colorKey] || '#666666';

  // Define the actual colors for each option using theme colors
  const colorMap = {
    primary: getColorValue('primary_color'),
    secondary: getColorValue('secondary_color'),
    tertiary: getColorValue('tertiary_color'),
    neutral: getColorValue('neutral_color'),
  };

  return (
    <div className="color-circles-widget field">
      {title && (
        <label htmlFor={`field-${id}`}>
          {title}
          {required && <span className="required"> *</span>}
        </label>
      )}
      
      <div className="color-circles-container">
        {choices.map(([choiceValue, choiceLabel]) => (
          <button
            key={choiceValue}
            type="button"
            className={cx('color-circle', {
              'color-circle--selected': value === choiceValue,
              'color-circle--white': choiceValue === 'white',
              'color-circle--black': choiceValue === 'black',
            })}
            style={{
              backgroundColor: colorMap[choiceValue] || '#cccccc',
            }}
            onClick={() => onChange(id, choiceValue)}
            title={choiceLabel}
            aria-label={choiceLabel}
            aria-pressed={value === choiceValue}
          >
            {value === choiceValue && (
              <svg
                className="color-circle-check"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5 4.5L6 12L2.5 8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorCirclesWidget;