import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Button } from '@plone/components';
import VariationPreview from './VariationPreview';
import { getVariationMetadata, getVariationIcon } from './variationMetadata';

const VariationModal = ({ block, onVariationInsert, onClose }) => {
  const intl = useIntl();

  const getFormatMessage = (message) =>
    intl.formatMessage({
      id: message,
      defaultMessage: message,
    });

  // Filter out variations that should not be shown (like 'default' titles)
  const visibleVariations =
    block.variations?.filter(
      (variation) => !variation.title.toLowerCase().includes('default'),
    ) || [];

  const handleDefaultInsert = () => {
    onVariationInsert(null); // Insert block without specific variation
    onClose();
  };

  const handleVariationInsert = (variation) => {
    onVariationInsert(variation);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="variation-modal-overlay" onClick={handleOverlayClick}>
      <div className="variation-modal-content">
        <div className="variation-modal-header">
          <div className="header-content">
            <h2 className="modal-title">
              Choose a variation for {getFormatMessage(block.title)}
            </h2>
            <p className="modal-description">
              Select the version that best fits your content needs.
            </p>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="variation-modal-body">
          <div className="variations-grid">
            {/* Default variation */}
            <div className="variation-card-modal default">
              <div className="variation-preview-container">
                <VariationPreview
                  block={block}
                  variation={null}
                  isDefault={true}
                />
              </div>
              <div className="variation-info">
                <div className="variation-header">
                  <div className="variation-name">
                    <span className="variation-icon">
                      {getVariationIcon(
                        getVariationMetadata(block.id, 'default'),
                      )}
                    </span>
                    {getVariationMetadata(block.id, 'default').title}
                  </div>
                  <div className="variation-badge default">Default</div>
                </div>
                <div className="variation-description">
                  {getVariationMetadata(block.id, 'default').description}
                </div>
              </div>
              <Button
                className="variation-button primary"
                onClick={handleDefaultInsert}
              >
                Use {getVariationMetadata(block.id, 'default').title}
              </Button>
            </div>

            {/* Other variations */}
            {visibleVariations.map((variation) => {
              const metadata = getVariationMetadata(block.id, variation.id);
              return (
                <div key={variation.id} className="variation-card-modal">
                  <div className="variation-preview-container">
                    <VariationPreview
                      block={block}
                      variation={variation}
                      isDefault={false}
                    />
                  </div>
                  <div className="variation-info">
                    <div className="variation-header">
                      <div className="variation-name">
                        <span className="variation-icon">
                          {getVariationIcon(metadata)}
                        </span>
                        {metadata.title}
                      </div>
                    </div>
                    <div className="variation-description">
                      {metadata.description}
                    </div>
                  </div>
                  <Button
                    className="variation-button"
                    onClick={() => handleVariationInsert(variation)}
                  >
                    Use {metadata.title}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

VariationModal.propTypes = {
  block: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    variations: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
  onVariationInsert: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VariationModal;
