import React, { useState, useCallback } from 'react';
import cx from 'classnames';
import { isEmpty, without } from 'lodash';
import {
  emptyBlocksForm,
  withBlockExtensions,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import BodyComponent from './Body';

import config from '@plone/volto/registry';
import {
  SidebarPortal,
  BlockDataForm,
  BlocksToolbar,
} from '@plone/volto/components';
import PropTypes from 'prop-types';
import { Segment, Button, Confirm } from 'semantic-ui-react';
import EditSchema from './EditSchema';

// Import section browser components
import { SectionBrowser } from '../../../../../../../components/SectionBrowser';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import templateSVG from '@plone/volto/icons/paste.svg';
import plusSVG from '@plone/volto/icons/circle-plus.svg';

import CounterComponent from './CounterComponent';
import './editor.less';
import { defineMessages, injectIntl } from 'react-intl';
import { compose } from 'redux';

const messages = defineMessages({
  sectionGroupSettings: {
    id: 'SectionGroupSettings',
    defaultMessage: 'Section (Group) settings',
  },
  section: {
    id: 'sectionTitle',
    defaultMessage: 'Custom Section',
  },
});

const Edit = (props) => {
  const { block, data, onChangeBlock, selected, formDescription } = props;
  const [multiSelected, setMultiSelected] = useState([]);
  const [showSectionBrowser, setShowSectionBrowser] = useState(false);
  const [showChangeWarning, setShowChangeWarning] = useState(false);
  const [pendingSection, setPendingSection] = useState(null);
  const data_blocks = data?.data?.blocks;
  // Don't create empty blocks form automatically - keep it truly empty
  const childBlocksForm = isEmpty(data_blocks)
    ? { blocks: {}, blocks_layout: { items: [] } }
    : data.data;

  const [selectedBlock, setSelectedBlock] = useState(
    childBlocksForm.blocks_layout.items[0],
  );

  // Check if section is empty (no blocks or only empty blocks)
  const isSectionEmpty =
    isEmpty(data_blocks) || childBlocksForm.blocks_layout.items.length === 0;

  const handleKeyDown = (
    e,
    index,
    block,
    node,
    {
      disableEnter = false,
      disableArrowUp = false,
      disableArrowDown = false,
    } = {},
  ) => {
    const hasblockActive = !!selectedBlock;
    if (e.key === 'ArrowUp' && !disableArrowUp && !hasblockActive) {
      props.onFocusPreviousBlock(block, node);
      e.preventDefault();
    }
    if (e.key === 'ArrowDown' && !disableArrowDown && !hasblockActive) {
      props.onFocusNextBlock(block, node);
      e.preventDefault();
    }
    if (e.key === 'Enter' && !disableEnter && !hasblockActive) {
      props.onAddBlock(config.settings.defaultBlockType, index + 1);
      e.preventDefault();
    }
  };

  const onSelectBlock = useCallback(
    (id, isMultipleSelection, event, activeBlock) => {
      let newMultiSelected = [];
      let selected = id;

      if (isMultipleSelection) {
        selected = null;
        const blocksLayoutFieldname = getBlocksLayoutFieldname(data?.data);
        const blocks_layout = data?.data[blocksLayoutFieldname].items;
        if (event.shiftKey) {
          const anchor =
            multiSelected.length > 0
              ? blocks_layout.indexOf(multiSelected[0])
              : blocks_layout.indexOf(activeBlock);
          const focus = blocks_layout.indexOf(id);
          if (anchor === focus) {
            newMultiSelected = [id];
          } else if (focus > anchor) {
            newMultiSelected = [...blocks_layout.slice(anchor, focus + 1)];
          } else {
            newMultiSelected = [...blocks_layout.slice(focus, anchor + 1)];
          }
        }
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
          if (multiSelected.includes(id)) {
            selected = null;
            newMultiSelected = without(multiSelected, id);
          } else {
            newMultiSelected = [...(multiSelected || []), id];
          }
        }
      }

      setSelectedBlock(selected);
      setMultiSelected(newMultiSelected);
    },
    [data.data, multiSelected],
  );

  const changeBlockData = (newBlockData) => {
    let pastedBlocks = newBlockData.blocks_layout.items.filter((blockID) => {
      return !data?.data?.blocks_layout.items.find((x) => x === blockID);
    });
    const selectedIndex =
      data.data.blocks_layout.items.indexOf(selectedBlock) + 1;
    onChangeBlock(block, {
      ...data,
      data: {
        ...data?.data,
        ...newBlockData,
        blocks_layout: {
          items: [
            ...data.data.blocks_layout.items.slice(0, selectedIndex),
            ...pastedBlocks,
            ...data.data.blocks_layout.items.slice(selectedIndex),
          ],
        },
      },
    });
  };

  // Handle section template application from SectionBrowser
  const handleApplySectionTemplate = useCallback(
    (section) => {
      // If section is not empty, show warning first
      if (!isSectionEmpty) {
        setPendingSection(section);
        setShowSectionBrowser(false);
        setShowChangeWarning(true);
        return;
      }

      // Apply section directly if empty
      const template = section.template();
      // Set the section title if current title is empty
      const sectionTitle = !data.title || data.title.trim() === '' ? section.title : data.title;
      
      onChangeBlock(block, {
        ...data,
        title: sectionTitle,
        data: {
          blocks: template.blocks,
          blocks_layout: template.blocks_layout,
        },
      });
      setShowSectionBrowser(false);
    },
    [block, data, onChangeBlock, isSectionEmpty],
  );

  // Handle confirmed section change (after warning)
  const handleConfirmSectionChange = useCallback(() => {
    if (pendingSection) {
      const template = pendingSection.template();
      // Always use the new section title when replacing
      onChangeBlock(block, {
        ...data,
        title: pendingSection.title,
        data: {
          blocks: template.blocks,
          blocks_layout: template.blocks_layout,
        },
      });
    }
    setShowChangeWarning(false);
    setPendingSection(null);
  }, [block, data, onChangeBlock, pendingSection]);

  // Handle cancel section change
  const handleCancelSectionChange = useCallback(() => {
    setShowChangeWarning(false);
    setPendingSection(null);
  }, []);

  // Handle creating a new section after current one
  const handleCreateNewSection = useCallback(() => {
    if (props.onAddBlock) {
      props.onAddBlock('group', props.index + 1);
    }
  }, [props]);

  React.useEffect(() => {
    if (
      isEmpty(data_blocks) &&
      childBlocksForm.blocks_layout.items[0] !== selectedBlock
    ) {
      setSelectedBlock(childBlocksForm.blocks_layout.items[0]);
      onChangeBlock(block, {
        ...data,
        data: childBlocksForm,
      });
    }
  }, [onChangeBlock, childBlocksForm, selectedBlock, block, data, data_blocks]);

  // Get editing instructions from block settings or props
  let instructions = data?.instructions?.data || data?.instructions;
  if (!instructions || instructions === '<p><br/></p>') {
    instructions = formDescription;
  }

  return (
    <div className="custom-section-block-edit">
      {/* Title Input */}
      <div className="custom-section-title-input">
        <input
          type="text"
          placeholder="Section title (optional)"
          value={data.title || ''}
          onChange={(e) => {
            onChangeBlock(block, {
              ...data,
              title: e.target.value,
            });
          }}
          className="section-title-field"
        />
      </div>

      <fieldset
        role="presentation"
        id={props.data.id}
        className={cx('section-block', props.data.className)}
        onKeyDown={(e) => {
          handleKeyDown(e, props.index, props.block, props.blockNode.current);
        }}
        tabIndex={-1}
      >
        <div className="section-header">
          <legend
            onClick={() => {
              setSelectedBlock();
              props.setSidebarTab(1);
            }}
            aria-hidden="true"
          >
            {data.title || props.intl.formatMessage(messages.section)}
          </legend>
          {!isSectionEmpty && (
            <Button
              basic
              size="mini"
              onClick={() => setShowSectionBrowser(true)}
              className="change-section-button"
              title="Change section template"
            >
              <Icon name={templateSVG} size="12px" />
              Change
            </Button>
          )}
        </div>

        {isSectionEmpty ? (
          <div className="section-empty-state">
            <Button
              primary
              size="huge"
              onClick={() => setShowSectionBrowser(true)}
              className="choose-section-button"
            >
              <Icon name={templateSVG} size="18px" />
              Choose a section
            </Button>
            <p className="empty-section-help">
              Start with a pre-designed section template or add blocks manually
            </p>
          </div>
        ) : (
          <BodyComponent
            {...props}
            isEditMode={true}
            selectedBlock={selectedBlock}
            setSelectedBlock={setSelectedBlock}
            multiSelected={multiSelected}
            setMultiSelected={setMultiSelected}
            onSelectBlock={onSelectBlock}
            childBlocksForm={childBlocksForm}
          />
        )}

        {selected ? (
          <BlocksToolbar
            selectedBlock={Object.keys(selectedBlock || {})[0]}
            selectedBlocks={multiSelected}
            onSetSelectedBlocks={(blockIds) => {
              setMultiSelected(blockIds);
            }}
            formData={data.data}
            onSelectBlock={(id, l, e) => {
              const isMultipleSelection = e
                ? e.shiftKey || e.ctrlKey || e.metaKey
                : false;

              onSelectBlock(id, isMultipleSelection, e, selectedBlock);
            }}
            onChangeBlocks={(newBlockData) => {
              changeBlockData(newBlockData);
            }}
          />
        ) : (
          ''
        )}

        {props.data.maxChars && (
          <CounterComponent {...props} setSelectedBlock={setSelectedBlock} />
        )}

        <SidebarPortal selected={selected && !selectedBlock}>
          {instructions && (
            <Segment attached>
              <div dangerouslySetInnerHTML={{ __html: instructions }} />
            </Segment>
          )}
          {!data?.readOnlySettings && (
            <BlockDataForm
              schema={EditSchema(props.intl)}
              title={props.intl.formatMessage(messages.sectionGroupSettings)}
              formData={data}
              onChangeField={(id, value) => {
                props.onChangeBlock(props.block, {
                  ...props.data,
                  [id]: value,
                });
              }}
            />
          )}
        </SidebarPortal>
      </fieldset>

      {/* Create New Section Button - only show when selected */}
      {selected && (
        <div className="new-section-button-container">
          <button
            type="button"
            onClick={handleCreateNewSection}
            className="ui basic button new-add-section"
            title="Add a new section below"
          >
            <Icon name={plusSVG} size="16px" className="icon" />
            Add a new section
          </button>
        </div>
      )}

      {/* Section Browser Modal */}
      {showSectionBrowser && (
        <SectionBrowser
          open={showSectionBrowser}
          onClose={() => setShowSectionBrowser(false)}
          blockId={block}
          onInsertSection={handleApplySectionTemplate}
          properties={{ blocks: { [block]: {} }, blocks_layout: { items: [block] } }}
        />
      )}

      {/* Change Section Warning Modal */}
      <Confirm
        open={showChangeWarning}
        onCancel={handleCancelSectionChange}
        onConfirm={handleConfirmSectionChange}
        header="Replace Section Content"
        content={`Are you sure you want to replace this section with "${pendingSection?.title}"? Your current content will be lost and cannot be recovered.`}
        confirmButton={{ content: 'OK', color: 'red' }}
        cancelButton="Cancel"
      />
    </div>
  );
};

Edit.propTypes = {
  block: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  manage: PropTypes.bool.isRequired,
};

export default compose(injectIntl, withBlockExtensions)(Edit);
