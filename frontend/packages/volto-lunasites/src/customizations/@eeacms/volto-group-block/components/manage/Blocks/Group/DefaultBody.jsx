import React from 'react';
import { Button } from 'semantic-ui-react';
import { BlocksForm, Icon, RenderBlocks } from '@plone/volto/components';
import EditBlockWrapper from '@eeacms/volto-group-block/components/manage/Blocks/Group/EditBlockWrapper';
import FloatingAddButton from 'volto-lunasites/components/FloatingAddButton';
import { useLocation } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { v4 as uuid } from 'uuid';

import helpSVG from '@plone/volto/icons/help.svg';

const GroupBlockDefaultBody = (props) => {
  const location = useLocation();
  const {
    block,
    data,
    onChangeBlock,
    onChangeField,
    pathname,
    selected,
    selectedBlock,
    onSelectBlock,
    setSelectedBlock,
    manage,
    childBlocksForm,
    multiSelected,
    formDescription,
    isEditMode,
  } = props;
  const metadata = props.metadata || props.properties;
  const blockState = {};

  // Get editing instructions from block settings or props
  let instructions = data?.instructions?.data || data?.instructions;
  if (!instructions || instructions === '<p><br/></p>') {
    instructions = formDescription;
  }

  // Check if this group is empty
  const isEmptyBlocks = !data?.data?.blocks || Object.keys(data.data.blocks).length === 0;
  const isEmptyLayout = !data?.data?.blocks_layout?.items || data.data.blocks_layout.items.length === 0;
  const isEmptySection = isEmptyBlocks || isEmptyLayout;

  // Handle adding first block to empty group
  const handleAddFirstBlock = (blockData) => {
    const newBlockId = uuid();
    
    const newBlocksData = {
      blocks: {
        [newBlockId]: blockData,
      },
      blocks_layout: {
        items: [newBlockId],
      },
    };

    // Update the group's data
    onChangeBlock(block, {
      ...data,
      data: newBlocksData,
    });

    // Select the newly created block
    setSelectedBlock(newBlockId);
  };

  return isEditMode ? (
    <BlocksForm
      {...props}
      metadata={metadata}
      properties={childBlocksForm}
      manage={manage}
      selectedBlock={selected ? selectedBlock : null}
      allowedBlocks={data.allowedBlocks}
      title={data.placeholder}
      description={instructions}
      onSelectBlock={(id, l, e) => {
        const isMultipleSelection = e
          ? e.shiftKey || e.ctrlKey || e.metaKey
          : false;
        onSelectBlock(id, isMultipleSelection, e, selectedBlock);
      }}
      onChangeFormData={(newFormData) => {
        onChangeBlock(block, {
          ...data,
          data: newFormData,
        });
      }}
      onChangeField={(id, value) => {
        if (['blocks', 'blocks_layout'].indexOf(id) > -1) {
          blockState[id] = value;
          onChangeBlock(block, {
            ...data,
            data: {
              ...data.data,
              ...blockState,
            },
          });
        } else {
          onChangeField(id, value);
        }
      }}
      pathname={pathname}
    >
      {({ draginfo }, editBlock, blockProps) => (
        <EditBlockWrapper
          draginfo={draginfo}
          blockProps={blockProps}
          disabled={data.disableInnerButtons}
          extraControls={
            <>
              {instructions && (
                <>
                  <Button
                    icon
                    basic
                    title="Section help"
                    onClick={() => {
                      setSelectedBlock();
                      const tab = manage ? 0 : 1;
                      props.setSidebarTab(tab);
                    }}
                  >
                    <Icon name={helpSVG} className="" size="19px" />
                  </Button>
                </>
              )}
            </>
          }
          multiSelected={multiSelected.includes(blockProps.block)}
        >
          {/* Render the normal blocks */}
          {editBlock}
          
          {/* Add floating button if section is empty */}
          {isEmptySection && isEditMode && (
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              backgroundColor: 'red',
              padding: '10px',
              color: 'white'
            }}>
              TEST BUTTON - EMPTY SECTION
            </div>
          )}
        </EditBlockWrapper>
      )}
    </BlocksForm>
  ) : (
    <RenderBlocks
      location={location}
      metadata={metadata}
      content={data?.data || {}}
    />
  );
};

export default GroupBlockDefaultBody;