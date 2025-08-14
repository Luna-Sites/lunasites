import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

// Component imports
import { Button, Tabs, CloseIcon } from '@plone/components';
import {
  Tab,
  TabList,
  TabPanel,
  Modal,
  ModalOverlay,
} from 'react-aria-components';
import Icon from '@plone/volto/components/theme/Icon/Icon';

// Local component imports
import SectionCard from './SectionCard';
import { sectionCategories, getSectionsByCategory } from './sectionTemplates';

// Volto helpers and config
import { addBlock } from '@plone/volto/helpers/Blocks/Blocks';
import config from '@plone/volto/registry';

// Icons
import plusSVG from '@plone/volto/icons/circle-plus.svg';

// Styles
import './SectionStyles.less';

const SectionBrowser = React.memo(
  ({
    open,
    onClose,
    blockId,
    onChangeFormData,
    onInsertSection,
    properties,
    // Additional props for BlockChooser compatibility
    allowedBlocks,
    showRestricted = false,
    blocksConfig,
    navRoot,
    contentType,
    onInsertBlock: externalOnInsertBlock,
  }) => {
    const intl = useIntl();

    // Memoize current blocks and layout for performance
    const currentBlocks = useMemo(
      () => properties?.blocks || {},
      [properties?.blocks],
    );
    const currentLayout = useMemo(
      () => properties?.blocks_layout?.items || [],
      [properties?.blocks_layout?.items],
    );

    const handleInsertSection = useCallback(
      (section) => {
        // If onInsertSection is provided, use it directly with the section object
        if (onInsertSection) {
          onInsertSection(section);
          onClose();
          return;
        }

        const template = section.template();
        const insertIndex = blockId ? currentLayout.indexOf(blockId) : -1;

        if (insertIndex === -1) {
          console.error(
            'SectionBrowser: Could not find the Section Browser trigger block to replace.',
          );
          return;
        }

        const { [blockId]: removedBlock, ...blocksWithoutTrigger } =
          currentBlocks;
        const newBlocks = { ...blocksWithoutTrigger, ...template.blocks };
        const newLayoutItems = [
          ...currentLayout.slice(0, insertIndex),
          ...template.blocks_layout.items,
          ...currentLayout.slice(insertIndex + 1),
        ];

        const finalFormData = {
          blocks: newBlocks,
          blocks_layout: {
            items: newLayoutItems,
          },
        };

        if (onChangeFormData) {
          onChangeFormData(finalFormData);
        } else if (externalOnInsertBlock) {
          // For BlockChooser mode, we need to insert the template differently
          // We'll insert each block from the template individually
          template.blocks_layout.items.forEach((templateBlockId, index) => {
            const blockData = {
              '@type': template.blocks[templateBlockId]['@type'],
              ...template.blocks[templateBlockId],
            };
            // Insert each block, using the current block as reference for the first one
            const targetBlockId = index === 0 ? blockId : templateBlockId;
            externalOnInsertBlock(targetBlockId, blockData);
          });
        }
        onClose();
      },
      [
        blockId,
        currentBlocks,
        currentLayout,
        onChangeFormData,
        onInsertSection,
        onClose,
        externalOnInsertBlock,
      ],
    );

    const handleInsertBlock = useCallback(
      (currentBlock, blockData) => {
        // If we have an external onInsertBlock callback (from BlockChooser mode),
        // use it instead of the form data manipulation
        if (externalOnInsertBlock) {
          externalOnInsertBlock(currentBlock, blockData);
          onClose();
          return;
        }

        // Otherwise, use the original form data manipulation for SectionBrowserBlock mode
        const insertIndex = blockId ? currentLayout.indexOf(blockId) : -1;

        if (insertIndex === -1) {
          console.error(
            'SectionBrowser: Could not find the Section Browser trigger block to replace.',
          );
          return;
        }

        try {
          // Use Volto's standard addBlock helper to create a new block
          const [newBlockId, newFormData] = addBlock(
            { blocks: currentBlocks, blocks_layout: { items: currentLayout } },
            blockData['@type'],
            insertIndex,
            config.blocks.blocksConfig,
            intl,
          );

          // Remove the trigger block from the new form data
          const { [blockId]: removedBlock, ...blocksWithoutTrigger } =
            newFormData.blocks;
          const newLayoutItems = newFormData.blocks_layout.items.filter(
            (id) => id !== blockId,
          );

          // Apply any additional block data (like variation) to the newly created block
          const finalBlocks = { ...blocksWithoutTrigger };
          if (newBlockId && blockData.variation) {
            finalBlocks[newBlockId] = {
              ...finalBlocks[newBlockId],
              variation: blockData.variation,
            };
          }

          const finalFormData = {
            blocks: finalBlocks,
            blocks_layout: { items: newLayoutItems },
          };

          onChangeFormData(finalFormData);
        } catch (error) {
          console.error('SectionBrowser: Error during block insertion:', error);
        }

        onClose();
      },
      [
        externalOnInsertBlock,
        onClose,
        currentBlocks,
        currentLayout,
        blockId,
        onChangeFormData,
        intl,
      ],
    );

    return (
      <ModalOverlay
        isOpen={open}
        onOpenChange={onClose}
        className="modal-overlay"
      >
        <Modal className="section-browser-modal">
          <div className="modal-header">
            <h2 className="modal-title">
              <Icon name={plusSVG} size="24px" />
              <span>Add Section</span>
            </h2>
            <Button
              className="close-button"
              aria-label="Close"
              onClick={onClose}
              isQuiet
            >
              {/* Use the imported CloseIcon component */}
              <Icon name={CloseIcon} size="32px" />
            </Button>
          </div>

          {/* The Tabs component from @plone/components acts as the main wrapper */}
          <Tabs className="modal-content">
            {/* The TabList from react-aria-components holds the individual tabs */}
            <TabList aria-label="Section Categories" className="category-tabs">
              {sectionCategories.map((category) => (
                // Each Tab is from react-aria-components
                <Tab key={category.id} id={category.id} className="tab">
                  {category.label}
                </Tab>
              ))}
            </TabList>

            <div className="panels-container">
              {sectionCategories.map((category) => (
                // Each TabPanel is from react-aria-components
                <TabPanel key={category.id} id={category.id}>
                  <div className="sections-grid">
                    {getSectionsByCategory(category.id).map((section) => (
                      <SectionCard
                        key={section.id}
                        section={section}
                        onInsert={handleInsertSection}
                      />
                    ))}
                  </div>
                </TabPanel>
              ))}
            </div>
          </Tabs>
        </Modal>
      </ModalOverlay>
    );
  },
);

SectionBrowser.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  blockId: PropTypes.string.isRequired,
  onChangeFormData: PropTypes.func,
  properties: PropTypes.shape({
    blocks: PropTypes.object,
    blocks_layout: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
  // Additional props for BlockChooser compatibility
  allowedBlocks: PropTypes.arrayOf(PropTypes.string),
  showRestricted: PropTypes.bool,
  blocksConfig: PropTypes.objectOf(PropTypes.any),
  navRoot: PropTypes.string,
  contentType: PropTypes.string,
  onInsertBlock: PropTypes.func,
};

SectionBrowser.defaultProps = {
  onChangeFormData: null,
  allowedBlocks: null,
  showRestricted: false,
  blocksConfig: null,
  navRoot: null,
  contentType: null,
  onInsertBlock: null,
};

export default SectionBrowser;
