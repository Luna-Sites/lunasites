import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import {
  applyBlockDefaults,
  applyBlockInitialValue,
  getBlocksFieldname,
  blockHasValue,
  buildStyleClassNamesFromData,
  buildStyleObjectFromData,
  buildStyleClassNamesExtenders,
} from '@plone/volto/helpers/Blocks/Blocks';
import dragSVG from '@plone/volto/icons/drag.svg';
import { Button } from 'semantic-ui-react';
import includes from 'lodash/includes';
import isBoolean from 'lodash/isBoolean';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import config from '@plone/volto/registry';
import BlockChooserButton from '@plone/volto/components/manage/BlockChooser/BlockChooserButton';

import trashSVG from '@plone/volto/icons/delete.svg';
import saveSVG from '@plone/volto/icons/save.svg';
import { SaveSectionModal } from '../../../../../../components/SaveSectionModal';
import { saveCustomSection, getCustomSections } from '../../../../../../actions/customSections';

const messages = defineMessages({
  delete: {
    id: 'delete',
    defaultMessage: 'delete',
  },
  saveSection: {
    id: 'saveSection',
    defaultMessage: 'Save section as template',
  },
});

const EditBlockWrapper = (props) => {
  const dispatch = useDispatch();
  const saveState = useSelector(state => state.customSections?.save);
  const customSectionsState = useSelector(state => state.customSections);
  const [showSaveModal, setShowSaveModal] = React.useState(false);

  // Close modal when save is successful
  React.useEffect(() => {
    if (saveState?.loaded && showSaveModal) {
      console.log('Save successful, closing modal'); // Debug
      setShowSaveModal(false);
      
      // Force refresh of custom sections data
      dispatch(getCustomSections());
    }
  }, [saveState?.loaded, showSaveModal, dispatch]);
  
  const hideHandler = (data) => {
    return (
      !!data.fixed ||
      (!config.experimental.addBlockButton.enabled &&
        !(blockHasValue(data) && props.blockProps.editable))
    );
  };

  const handleSaveSection = () => {
    setShowSaveModal(true);
  };

  const handleModalSave = ({ name, description, category }) => {
    const { blockProps } = props;
    const { data } = blockProps;
    
    console.log('handleModalSave received:', { name, description, category }); // Debug
    
    // Get section data to save
    const sectionData = {
      name,
      description,
      category,
      data: {
        title: data.title || 'Untitled Section',
        data: data.data, // The blocks data
        '@type': 'group',
      },
    };

    // Dispatch the Redux action
    dispatch(saveCustomSection(sectionData));
  };

  const { intl, blockProps, draginfo, children } = props;
  const {
    allowedBlocks,
    showRestricted,
    block,
    blocksConfig,
    selected,
    type,
    onChangeBlock,
    onDeleteBlock,
    onInsertBlock,
    onSelectBlock,
    onMutateBlock,
    data: originalData,
    editable,
    properties,
    showBlockChooser,
    navRoot,
    contentType,
  } = blockProps;

  const data = applyBlockDefaults({ data: originalData, ...blockProps, intl });

  const visible = selected && !hideHandler(data);

  const required = isBoolean(data.required)
    ? data.required
    : includes(config.blocks.requiredBlocks, type);

  let classNames = buildStyleClassNamesFromData(data.styles);
  classNames = buildStyleClassNamesExtenders({
    block,
    content: properties,
    data,
    classNames,
  });
  const style = buildStyleObjectFromData(data);

  // We need to merge the StyleWrapper styles with the draggable props from b-D&D
  const styleMergedWithDragProps = {
    ...draginfo.draggableProps,
    style: { ...style, ...draginfo.draggableProps.style },
  };

  return (
    <div
      ref={draginfo.innerRef}
      {...styleMergedWithDragProps}
      // Right now, we can have the alignment information in the styles property or in the
      // block data root, we inject the classname here for having control over the whole
      // Block Edit wrapper
      className={cx(`block-editor-${data['@type']}`, classNames, {
        [data.align]: data.align,
      })}
    >
      <div style={{ position: 'relative' }}>
        {/* Modern toolbar only for group blocks, original for others */}
        {visible && type === 'group' && (
          <div className="block-toolbar">
            {!required && editable && (
              <Button
                type="button"
                icon
                basic
                onClick={() => onDeleteBlock(block, true)}
                className="delete-button-group-block"
                aria-label={intl.formatMessage(messages.delete)}
                title="Remove block"
              >
                <Icon name={trashSVG} size="19px" />
              </Button>
            )}
            
            <Button
              icon
              basic
              title="Drag and drop"
              className="drag handle wrapper"
              {...draginfo.dragHandleProps}
            >
              <Icon name={dragSVG} size="19px" />
            </Button>

            <Button
              icon
              basic
              title={intl.formatMessage(messages.saveSection)}
              onClick={handleSaveSection}
              className="save-section-button"
            >
              <Icon name={saveSVG} size="19px" />
            </Button>
          </div>
        )}

        {/* Original toolbar design for non-group blocks */}
        <div
          style={{
            visibility: visible && type !== 'group' ? 'visible' : 'hidden',
            display: visible && type !== 'group' ? 'inline-block' : 'none',
          }}
          {...draginfo.dragHandleProps}
          className="drag handle wrapper"
        >
          <Icon name={dragSVG} size="18px" />
        </div>

        <div className={`ui drag block inner ${type}`}>
          {children}
          {/* Original delete button for non-group blocks */}
          {selected && !required && editable && type !== 'group' && (
            <Button
              type="button"
              icon
              basic
              onClick={() => onDeleteBlock(block, true)}
              className="delete-button"
              aria-label={intl.formatMessage(messages.delete)}
            >
              <Icon name={trashSVG} size="18px" />
            </Button>
          )}
          {config.experimental.addBlockButton.enabled && showBlockChooser && type !== 'group' && (
            <BlockChooserButton
              data={data}
              block={block}
              onInsertBlock={(id, value) => {
                if (blockHasValue(data)) {
                  onSelectBlock(onInsertBlock(id, value));
                } else {
                  const blocksFieldname = getBlocksFieldname(properties);
                  const newFormData = applyBlockInitialValue({
                    id,
                    value,
                    blocksConfig,
                    formData: {
                      ...properties,
                      [blocksFieldname]: {
                        ...properties[blocksFieldname],
                        [id]: value || null,
                      },
                    },
                    intl,
                  });
                  const newValue = newFormData[blocksFieldname][id];
                  onChangeBlock(id, newValue);
                }
              }}
              onMutateBlock={onMutateBlock}
              allowedBlocks={allowedBlocks}
              showRestricted={showRestricted}
              blocksConfig={blocksConfig}
              size="24px"
              properties={properties}
              navRoot={navRoot}
              contentType={contentType}
            />
          )}
        </div>
      </div>
      
      {/* Save Section Modal */}
      <SaveSectionModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleModalSave}
        loading={saveState?.loading || false}
        existingCategories={customSectionsState?.categories || []}
        key={customSectionsState?.loaded ? 'loaded' : 'loading'}
      />
    </div>
  );
};

export default injectIntl(EditBlockWrapper);
