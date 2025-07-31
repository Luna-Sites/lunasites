import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Local component imports
import SectionBrowser from './SectionBrowser';

/**
 * Wrapper component that adapts SectionBrowser to work as a Volto BlockChooser
 * This component is used to replace Volto's default BlockChooser with our SectionBrowser
 */
const SectionBrowserAsBlockChooser = React.memo(
  ({
    currentBlock,
    onInsertBlock,
    onMutateBlock,
    allowedBlocks,
    showRestricted,
    blocksConfig,
    properties,
    navRoot,
    contentType,
    ...rest
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Auto-open the modal when this component is rendered
    // This happens when Volto wants to show the block chooser
    useEffect(() => {
      setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      // Note: Volto will handle cleanup when the chooser is closed
    }, []);

    const handleInsertBlock = useCallback(
      (blockToReplace, blockData) => {
        // Use the provided callback to insert the block
        if (onInsertBlock) {
          onInsertBlock(blockToReplace, blockData);
        } else if (onMutateBlock) {
          onMutateBlock(blockToReplace, blockData);
        } else {
          console.error(
            'SectionBrowserAsBlockChooser: No insertion callback available!',
          );
        }

        // Close the modal after insertion
        setIsOpen(false);
      },
      [onInsertBlock, onMutateBlock],
    );

    // Create a mock properties object if not provided
    const sectionBrowserProperties = useMemo(
      () =>
        properties || {
          blocks: {},
          blocks_layout: { items: [] },
        },
      [properties],
    );

    return (
      <SectionBrowser
        open={isOpen}
        onClose={handleClose}
        blockId={currentBlock}
        // Don't provide onChangeFormData since we're in BlockChooser mode
        onChangeFormData={null}
        properties={sectionBrowserProperties}
        // Pass the insert callback so SectionBrowser knows we're in BlockChooser mode
        onInsertBlock={handleInsertBlock}
        // Pass through BlockChooser-specific props
        allowedBlocks={allowedBlocks}
        showRestricted={showRestricted}
        blocksConfig={blocksConfig}
        navRoot={navRoot}
        contentType={contentType}
        {...rest}
      />
    );
  },
);

SectionBrowserAsBlockChooser.propTypes = {
  currentBlock: PropTypes.string.isRequired,
  onInsertBlock: PropTypes.func,
  onMutateBlock: PropTypes.func,
  allowedBlocks: PropTypes.arrayOf(PropTypes.string),
  showRestricted: PropTypes.bool,
  blocksConfig: PropTypes.objectOf(PropTypes.any),
  properties: PropTypes.shape({
    blocks: PropTypes.object,
    blocks_layout: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
  navRoot: PropTypes.string,
  contentType: PropTypes.string,
};

SectionBrowserAsBlockChooser.defaultProps = {
  onInsertBlock: null,
  onMutateBlock: null,
  allowedBlocks: null,
  showRestricted: false,
  blocksConfig: null,
  properties: {
    blocks: {},
    blocks_layout: { items: [] },
  },
  navRoot: null,
  contentType: null,
};

export default SectionBrowserAsBlockChooser;
