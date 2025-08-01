import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import { defineMessages, useIntl } from 'react-intl';
import CompactBlockChooser from '../CompactBlockChooser';

// Icons
import plusSVG from '@plone/volto/icons/circle-plus.svg';

// Styles
import './FloatingAddButton.scss';

const messages = defineMessages({
  addBlock: {
    id: 'Add block',
    defaultMessage: 'Add block',
  },
  emptySection: {
    id: 'Empty section click to add',
    defaultMessage: 'This section is empty. Click to add your first block.',
  },
});

const FloatingAddButton = ({
  onAddBlock,
  blockId,
  allowedBlocks,
  blocksConfig,
  properties,
  className = '',
  inline = false, // New prop for inline positioning
}) => {
  const intl = useIntl();
  const [showBlockChooser, setShowBlockChooser] = useState(false);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBlockChooser(true);
  };

  const handleInsertBlock = (currentBlock, blockData) => {
    if (onAddBlock) {
      onAddBlock(blockData);
    }
    setShowBlockChooser(false);
  };

  const handleCloseChooser = () => {
    setShowBlockChooser(false);
  };

  return (
    <>
      <div className={`floating-add-button-container ${inline ? 'inline-mode' : ''} ${className}`.trim()}>
        <div className="floating-add-content">
          <Button
            type="button"
            className="floating-add-button"
            onClick={handleButtonClick}
            title={intl.formatMessage(messages.emptySection)}
            aria-label={intl.formatMessage(messages.addBlock)}
          >
            <Icon name={plusSVG} size="18px" className="add-icon" />
            <span className="add-text">
              {intl.formatMessage(messages.addBlock)}
            </span>
          </Button>
          {!inline && (
            <p className="floating-helper-text">
              {intl.formatMessage(messages.emptySection)}
            </p>
          )}
        </div>
      </div>

      {showBlockChooser && (
        <CompactBlockChooser
          open={showBlockChooser}
          onClose={handleCloseChooser}
          onInsertBlock={handleInsertBlock}
          currentBlock={blockId}
          allowedBlocks={allowedBlocks}
          showRestricted={false}
          blocksConfig={blocksConfig}
          properties={properties}
          navRoot={null}
          contentType={null}
          isInsideGroupBlock={true}
        />
      )}
    </>
  );
};

FloatingAddButton.propTypes = {
  onAddBlock: PropTypes.func.isRequired,
  blockId: PropTypes.string,
  allowedBlocks: PropTypes.arrayOf(PropTypes.string),
  blocksConfig: PropTypes.object,
  properties: PropTypes.object,
  className: PropTypes.string,
  inline: PropTypes.bool,
};

FloatingAddButton.defaultProps = {
  blockId: null,
  allowedBlocks: null,
  blocksConfig: null,
  properties: {},
  className: '',
  inline: false,
};

export default FloatingAddButton;