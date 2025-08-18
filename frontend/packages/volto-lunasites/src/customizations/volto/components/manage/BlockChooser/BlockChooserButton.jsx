import React from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';
import { usePopper } from 'react-popper';

// Semantic UI imports
import { Button, Ref } from 'semantic-ui-react';
import doesNodeContainClick from 'semantic-ui-react/dist/commonjs/lib/doesNodeContainClick';

// Volto imports
import Icon from '@plone/volto/components/theme/Icon/Icon';
import { blockHasValue } from '@plone/volto/helpers/Blocks/Blocks';
import config from '@plone/volto/registry';

// Local component imports
import SectionBrowserAsBlockChooser from '../../../../../components/SectionBrowser/SectionBrowserAsBlockChooser';
import CompactBlockChooser from '../../../../../components/CompactBlockChooser';

// Icons
import addSVG from '@plone/volto/icons/circle-plus.svg';

const messages = defineMessages({
  addBlock: {
    id: 'Add block',
    defaultMessage: 'Add block',
  },
});

export const ButtonComponent = (props) => {
  const intl = useIntl();
  const {
    className = `block-add-button${
      config.experimental.addBlockButton.enabled ? ' new-add-block' : ''
    }`,
    size = '19px',
    onShowBlockChooser,
  } = props;

  return (
    <Button
      type="button"
      icon
      basic
      title={intl.formatMessage(messages.addBlock)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onShowBlockChooser();
      }}
      className={className}
    >
      <Icon name={addSVG} className={className} size={size} />
    </Button>
  );
};

const BlockChooserButton = (props) => {
  const {
    block,
    allowedBlocks,
    showRestricted,
    data,
    onMutateBlock,
    onInsertBlock,
    blocksConfig,
    buttonComponent,
    properties,
    navRoot,
    contentType,
  } = props;

  const { disableNewBlocks } = data;
  const [addNewBlockOpened, setAddNewBlockOpened] = React.useState(false);

  const blockChooserRef = React.useRef();

  // Check if we're inside a group block by looking at properties structure
  // Group blocks have nested block structures
  const isInsideGroupBlock = React.useMemo(() => {
    // Check if this is a nested block structure (inside a group block)
    const hasNestedStructure =
      properties?.blocks && properties?.blocks_layout?.items;
    const isNotAtPageLevel =
      hasNestedStructure && !properties?.title && !properties?.description;

    // Additional check: if the properties object is small and focused, it's likely inside a group
    const isNested = hasNestedStructure && Object.keys(properties).length <= 3;

    // eslint-disable-next-line no-console
    // console.log('BlockChooser Context Detection:', {
    //   block,
    //   hasNestedStructure,
    //   isNotAtPageLevel,
    //   isNested,
    //   propertiesKeys: Object.keys(properties || {}),
    //   properties: properties,
    // });

    return isNested || isNotAtPageLevel;
  }, [properties, block]);

  const handleClickOutside = React.useCallback(
    (e) => {
      if (
        blockChooserRef.current &&
        doesNodeContainClick(blockChooserRef.current, e)
      )
        return;

      // Check for different modal classes based on chooser type
      const modalSelector = isInsideGroupBlock
        ? '.compact-block-chooser-modal'
        : '.section-browser-modal';
      const modalElement = document.querySelector(modalSelector);
      if (modalElement && modalElement.contains(e.target)) {
        return;
      }

      setAddNewBlockOpened(false);
    },
    [isInsideGroupBlock],
  );

  const Component = buttonComponent || ButtonComponent;

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside, false);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
  }, [handleClickOutside]);

  const [referenceElement, setReferenceElement] = React.useState(null);
  const [popperElement, setPopperElement] = React.useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: isInsideGroupBlock ? 'bottom-start' : 'bottom-end',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: isInsideGroupBlock ? [0, 8] : [0, 12],
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: isInsideGroupBlock
            ? ['bottom-end', 'top-start', 'top-end']
            : ['bottom-start', 'top-end', 'top-start'],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
          padding: 8,
        },
      },
    ],
  });

  // Choose the appropriate chooser based on context
  const ChooserComponent = isInsideGroupBlock
    ? CompactBlockChooser
    : SectionBrowserAsBlockChooser;

  return (
    <>
      {!disableNewBlocks &&
        (config.experimental.addBlockButton.enabled ||
          !blockHasValue(data)) && (
          <Ref innerRef={setReferenceElement}>
            <Component
              {...props}
              onShowBlockChooser={() => setAddNewBlockOpened(true)}
            />
          </Ref>
        )}
      {addNewBlockOpened &&
        (isInsideGroupBlock ? (
          // Render CompactBlockChooser as full-screen modal
          <ChooserComponent
            open={addNewBlockOpened}
            onClose={() => setAddNewBlockOpened(false)}
            onMutateBlock={
              onMutateBlock
                ? (id, value) => {
                    setAddNewBlockOpened(false);
                    onMutateBlock(id, value);
                  }
                : null
            }
            onInsertBlock={
              onInsertBlock
                ? (id, value) => {
                    setAddNewBlockOpened(false);
                    onInsertBlock(id, value);
                  }
                : null
            }
            currentBlock={block}
            allowedBlocks={allowedBlocks}
            blocksConfig={blocksConfig}
            properties={properties}
            showRestricted={showRestricted}
            ref={blockChooserRef}
            navRoot={navRoot}
            contentType={contentType}
            isInsideGroupBlock={isInsideGroupBlock}
          />
        ) : (
          // Use Popper positioning for section browser
          createPortal(
            <div
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              <ChooserComponent
                open={addNewBlockOpened}
                onClose={() => setAddNewBlockOpened(false)}
                onMutateBlock={
                  onMutateBlock
                    ? (id, value) => {
                        setAddNewBlockOpened(false);
                        onMutateBlock(id, value);
                      }
                    : null
                }
                onInsertBlock={
                  onInsertBlock
                    ? (id, value) => {
                        setAddNewBlockOpened(false);
                        onInsertBlock(id, value);
                      }
                    : null
                }
                currentBlock={block}
                allowedBlocks={allowedBlocks}
                blocksConfig={blocksConfig}
                properties={properties}
                showRestricted={showRestricted}
                ref={blockChooserRef}
                navRoot={navRoot}
                contentType={contentType}
                isInsideGroupBlock={isInsideGroupBlock}
              />
            </div>,
            document.body,
          )
        ))}
    </>
  );
};

export default BlockChooserButton;
