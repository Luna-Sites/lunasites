import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@plone/volto/components/theme/Icon/Icon';

const VariationPreview = ({
  block,
  variation,
  isDefault = false,
  metadata,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!metadata?.previewImage);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const renderPreview = () => {
    // Try to show preview image first
    if (metadata?.previewImage && !imageError) {
      return (
        <div className="variation-preview-image">
          <img
            src={metadata.previewImage}
            alt={`${metadata.title || 'Variation'} preview`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
          {imageLoading && <div className="image-loading">Loading...</div>}
        </div>
      );
    }

    // Fallback to icon-based preview
    return (
      <div className="variation-preview-icon">
        {metadata?.icon ? (
          <span className="metadata-icon" title={metadata.icon}>
            {metadata.icon}
          </span>
        ) : block.icon ? (
          <Icon name={block.icon} size="24px" />
        ) : (
          <span className="fallback-icon" title="Block">
            BLOCK
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="variation-preview-wrapper">
      <div className="variation-preview-content">{renderPreview()}</div>
      <div className="variation-preview-label">
        {isDefault
          ? 'Default'
          : metadata?.title || variation?.title || 'Variation'}
      </div>
    </div>
  );
};

VariationPreview.propTypes = {
  block: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  variation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  isDefault: PropTypes.bool,
  metadata: PropTypes.shape({
    icon: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    previewImage: PropTypes.string,
  }),
};

export default VariationPreview;
