import React from 'react';
import PropTypes from 'prop-types';
// Temporarily remove Icon import to fix error

const PreviewRenderer = ({ config, className = '', size = 'normal' }) => {
  if (!config) return null;

  const renderPreview = () => {
    switch (config.type) {
      case 'lines':
        return (
          <div className={`preview-lines ${className}`}>
            {config.config.lines.map((line, index) => (
              <div
                key={index}
                className="preview-line"
                style={{
                  width: line.width,
                  height: line.height,
                }}
              />
            ))}
          </div>
        );

      case 'media':
        return (
          <div 
            className={`preview-media ${className}`}
            style={{ background: config.config.background }}
          >
            <div className="preview-media-icon">
              {config.config.icon}
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`preview-list ${className}`}>
            {config.config.items.map((item, index) => (
              <div key={index} className="preview-list-item">
                <span className="preview-bullet">{item.bullet}</span>
                <div
                  className="preview-line"
                  style={{ width: item.width }}
                />
              </div>
            ))}
          </div>
        );

      case 'form':
        return (
          <div className={`preview-form ${className}`}>
            {config.config.fields.map((field, index) => (
              <div
                key={index}
                className="preview-form-field"
                style={{
                  width: field.width,
                  height: field.height,
                }}
              />
            ))}
            <div
              className="preview-form-button"
              style={{
                width: config.config.button.width,
                height: config.config.button.height,
              }}
            />
          </div>
        );

      case 'grid':
        return (
          <div className={`preview-grid ${className}`}>
            <div 
              className="preview-grid-container"
              style={{
                gridTemplateColumns: `repeat(${config.config.columns}, 1fr)`
              }}
            >
              {Array.from({ length: config.config.items }).map((_, index) => (
                <div key={index} className="preview-grid-item" />
              ))}
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`preview-table ${className}`}>
            <div className="preview-table-container">
              {/* Header row */}
              <div className="preview-table-row header">
                {Array.from({ length: config.config.cols }).map((_, index) => (
                  <div key={index} className="preview-table-cell" />
                ))}
              </div>
              {/* Data rows */}
              {Array.from({ length: config.config.rows - 1 }).map((_, rowIndex) => (
                <div key={rowIndex} className="preview-table-row">
                  {Array.from({ length: config.config.cols }).map((_, colIndex) => (
                    <div key={colIndex} className="preview-table-cell" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'card':
        return (
          <div className={`preview-card ${className}`}>
            {config.config.hasHeader && (
              <div className="preview-card-header" />
            )}
            <div className="preview-card-content">
              {config.config.lines.map((line, index) => (
                <div
                  key={index}
                  className="preview-line"
                  style={{
                    width: line.width,
                    height: line.height,
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'icon':
        return (
          <div className={`preview-icon ${className}`}>
            {config.config.icon ? (
              <span style={{ fontSize: size === 'small' ? '16px' : '24px' }}>
                {typeof config.config.icon === 'string' ? config.config.icon : 'BLOCK'}
              </span>
            ) : (
              <div className="preview-default-shape" />
            )}
          </div>
        );

      default:
        return (
          <div className={`preview-default ${className}`}>
            <div className="preview-default-shape" />
          </div>
        );
    }
  };

  return (
    <div className={`preview-renderer ${size} ${config.isDefault ? 'default' : ''} ${config.variant ? 'variant' : ''}`}>
      {renderPreview()}
    </div>
  );
};

PreviewRenderer.propTypes = {
  config: PropTypes.shape({
    type: PropTypes.string.isRequired,
    config: PropTypes.object.isRequired,
    isDefault: PropTypes.bool,
    variant: PropTypes.bool,
  }),
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'normal', 'large']),
};

PreviewRenderer.defaultProps = {
  size: 'normal',
  className: '',
};

export default PreviewRenderer;