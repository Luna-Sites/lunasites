import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Button } from '@plone/components';
import VariationPreview from './VariationPreview';
import { getVariationMetadata, getVariationIcon } from './variationMetadata';

const VariationPanel = ({ block, onVariationInsert }) => {
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
  };

  const handleVariationInsert = (variation) => {
    onVariationInsert(variation);
  };

  return (
    <>
      <div className="variation-panel">
        <div className="variation-panel-header">
          <div className="header-content">
            <h3 className="variation-panel-title">
              {getFormatMessage(block.title)} Variations
            </h3>
            <p className="variation-panel-description">
              Choose a variation for this block:
            </p>
          </div>
        </div>

        <div className="variation-panel-content">
          {/* Default block option */}
          <div className="variation-option">
            <div className="variation-card default">
              {(() => {
                const defaultMetadata = getVariationMetadata(
                  block.id,
                  'default',
                );
                return (
                  <>
                    <div className="variation-layout">
                      <div className="variation-preview-container">
                        <VariationPreview
                          block={block}
                          variation={null}
                          isDefault={true}
                          metadata={defaultMetadata}
                        />
                      </div>
                      <div className="variation-info">
                        <div className="variation-header">
                          <div className="variation-name">
                            <span className="variation-icon">
                              {getVariationIcon(defaultMetadata)}
                            </span>
                            {defaultMetadata.title}
                          </div>
                        </div>
                        <div className="variation-description">
                          {defaultMetadata.description}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="variation-button primary"
                      onClick={handleDefaultInsert}
                    >
                      Use {defaultMetadata.title}
                    </Button>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Block variations */}
          {visibleVariations.map((variation) => {
            const metadata = getVariationMetadata(block.id, variation.id);
            return (
              <div key={variation.id} className="variation-option">
                <div className="variation-card">
                  <div className="variation-layout">
                    <div className="variation-preview-container">
                      <VariationPreview
                        block={block}
                        variation={variation}
                        isDefault={false}
                        metadata={metadata}
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
                  </div>
                  <Button
                    className="variation-button"
                    onClick={() => handleVariationInsert(variation)}
                  >
                    Use {metadata.title}
                  </Button>
                </div>
              </div>
            );
          })}

          {/* {visibleVariations.length === 0 && (
            <div className="no-variations">
              <div className="no-variations-icon">⚡</div>
              <p>This block has no additional variations.</p>
              <p className="no-variations-hint">
                Only the default version is available.
              </p>
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

VariationPanel.propTypes = {
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
};

export default VariationPanel;
