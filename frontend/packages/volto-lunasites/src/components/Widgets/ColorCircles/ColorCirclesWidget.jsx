import React from 'react';
import cx from 'classnames';
import './ColorCirclesWidget.scss';

const ColorCirclesWidget = (props) => {
  const { id, title, required, value, onChange, choices = [] } = props;

  // Define the actual colors for each option
  const colorMap = {
    primary: 'var(--lunasites-primary-color, #094ce1)',
    secondary: 'var(--lunasites-secondary-color, #e73d5c)',
    tertiary: 'var(--lunasites-tertiary-color, #6bb535)',
    warning: '#ffc107',
    white: '#ffffff',
    black: '#000000',
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