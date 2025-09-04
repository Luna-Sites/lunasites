import {
  BlocksForm,
  Icon,
  SidebarPortal,
  BlocksToolbar,
  BlockDataForm,
} from '@plone/volto/components';
import {
  emptyBlocksForm,
  getBlocksLayoutFieldname,
  withBlockExtensions,
} from '@plone/volto/helpers';
import { cloneDeepSchema } from '@plone/volto/helpers/Utils/Utils';
import helpSVG from '@plone/volto/icons/help.svg';
import { isEmpty, without, pickBy } from 'lodash';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Segment } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import CustomAccordionEdit from './CustomAccordionEdit';
import AccordionFilter from '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/AccordionFilter';
import EditBlockWrapper from '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/EditBlockWrapper';
import '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/editor.less';
import { AccordionBlockSchema } from './schema';
import {
  emptyAccordion,
  getPanels,
} from '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/util';
import config from '@plone/volto/registry';

const messages = defineMessages({
  SectionHelp: {
    id: 'Section help',
    defaultMessage: 'Section help',
  },
  AccordionBlock: {
    id: 'Accordion block',
    defaultMessage: 'Accordion block',
  },
  Accordion: {
    id: 'Accordion',
    defaultMessage: 'Accordion',
  },
});

const Edit = (props) => {
  const [selectedBlock, setSelectedBlock] = useState({});
  const [multiSelected, setMultiSelected] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [activeObject, setActiveObject] = useState(0);
  const {
    block,
    data,
    onChangeBlock,
    onChangeField,
    pathname,
    selected,
    manage,
    formDescription,
  } = props;
  const lunaTheming = useSelector((state) => state.lunaTheming);

  const intl = useIntl();

  // Get accordion theme variations
  const accordionVariations = {
    primary_accordion: {
      titleBg: 'primary_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: 'none',
    },
    neutral_accordion: {
      titleBg: 'neutral_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: '1px solid #e1e5e9',
    },
    minimal_accordion: {
      titleBg: 'transparent',
      titleText: 'neutral_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: '1px solid #f1f3f5',
    },
    inverted_accordion: {
      titleBg: 'neutral_color',
      titleText: 'background_color',
      contentBg: 'transparent',
      contentText: 'neutral_color',
      border: 'none',
    },
    secondary_accent_accordion: {
      titleBg: 'secondary_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: 'none',
    },
    soft_bordered_accordion: {
      titleBg: 'background_color',
      titleText: 'neutral_color',
      contentBg: 'tertiary_color',
      contentText: 'neutral_color',
      border: '1px solid #e1e5e9',
    },
  };

  const currentTheme = data.accordion_theme || 'primary_accordion';
  const themeStyles =
    accordionVariations[currentTheme] || accordionVariations.primary_accordion;
  const colors = lunaTheming?.data?.colors || {};

  const getColorValue = (colorKey) => {
    if (colorKey === 'transparent') return 'transparent';
    return colors[colorKey] || '#666666';
  };

  // Handle both new panels structure and old data structure
  let properties;
  if (data.panels) {
    // Convert new panels structure to old data structure for editing
    const blocks = {};
    const items = [];

    data.panels.forEach((panel) => {
      const id = panel['@id'];
      // Use existing panel blocks if they exist, otherwise create empty form
      // IMPORTANT: Keep all panel properties including styling
      blocks[id] = panel.blocks
        ? {
            ...panel,
            title: panel.panel_title || panel.title || '',
            '@type': 'accordionPanel',
            // Preserve panel styling properties
            panel_backgroundColor: panel.panel_backgroundColor,
            panel_textColor: panel.panel_textColor,
            panel_titleColor: panel.panel_titleColor,
            panel_border: panel.panel_border,
          }
        : {
            ...emptyBlocksForm(),
            title: panel.panel_title || panel.title || '',
            '@type': 'accordionPanel',
            // Preserve panel styling properties
            panel_backgroundColor: panel.panel_backgroundColor,
            panel_textColor: panel.panel_textColor,
            panel_titleColor: panel.panel_titleColor,
            panel_border: panel.panel_border,
          };
      items.push(id);
    });

    properties = {
      blocks,
      blocks_layout: { items },
    };
  } else {
    properties = isEmpty(data?.data?.blocks) ? emptyAccordion(3) : data.data;
  }

  const metadata = props.metadata || props.properties;
  const [currentUid, setCurrentUid] = useState('');

  const onSelectBlock = (uid, id, isMultipleSelection, event, activeBlock) => {
    let newMultiSelected = [];
    let selected = id;

    if (Object.values(activeBlock || {})?.length > 0) {
      activeBlock = Object.values(activeBlock)[0];
    }
    if (properties?.blocks?.hasOwnProperty(uid) && isMultipleSelection) {
      selected = null;
      const blocksLayoutFieldname = getBlocksLayoutFieldname(
        properties.blocks[uid],
      );

      const blocks_layout = properties.blocks[uid][blocksLayoutFieldname].items;

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

    setSelectedBlock({ [uid]: selected });
    setCurrentUid(uid);
    setMultiSelected(newMultiSelected);
  };

  const searchElementInMultiSelection = (uid, blockprops) => {
    return !!multiSelected.find((el) => el === blockprops.block);
  };

  const applySchemaEnhancer = (originalSchema) => {
    let schema, schemaEnhancer;
    const formData = data;
    const { blocks } = config;

    const blockType = formData['@type'];
    const variations = blocks?.blocksConfig[blockType]?.variations || [];

    if (variations.length === 0) {
      schemaEnhancer = blocks.blocksConfig?.[blockType]?.schemaEnhancer;
      if (schemaEnhancer)
        schema = schemaEnhancer({ schema: originalSchema, formData, intl });
    }

    const activeItemName = formData?.variation;
    let activeItem = variations.find((item) => item.id === activeItemName);
    if (!activeItem) activeItem = variations.find((item) => item.isDefault);

    schemaEnhancer = activeItem?.['schemaEnhancer'];

    schema = schemaEnhancer
      ? schemaEnhancer({
          schema: cloneDeepSchema(originalSchema),
          formData,
          intl,
        })
      : cloneDeepSchema(originalSchema);

    return schema;
  };

  const setInitialData = () => {
    // For new structure, initialize with 3 panels
    if (!data.data && !data.panels) {
      const panels = [
        {
          '@id': `panel-${Date.now()}-1`,
          panel_title: 'Panel 1',
          panel_backgroundColor: null,
          panel_textColor: null,
          panel_titleColor: null,
          panel_border: false,
          ...emptyBlocksForm(),
        },
        {
          '@id': `panel-${Date.now()}-2`,
          panel_title: 'Panel 2',
          panel_backgroundColor: null,
          panel_textColor: null,
          panel_titleColor: null,
          panel_border: false,
          ...emptyBlocksForm(),
        },
        {
          '@id': `panel-${Date.now()}-3`,
          panel_title: 'Panel 3',
          panel_backgroundColor: null,
          panel_textColor: null,
          panel_titleColor: null,
          panel_border: false,
          ...emptyBlocksForm(),
        },
      ];

      return {
        ...data,
        panels,
      };
    }

    // For old structure
    const accordionSchema = applySchemaEnhancer(AccordionBlockSchema({ intl }));
    const defaultValues = Object.keys(accordionSchema.properties).reduce(
      (accumulator, currentVal) => {
        return accordionSchema.properties[currentVal].default
          ? {
              ...accumulator,
              [currentVal]: accordionSchema.properties[currentVal].default,
            }
          : accumulator;
      },
      {},
    );

    return {
      ...defaultValues,
      ...data,
      data: {
        ...properties,
      },
    };
  };

  React.useEffect(() => {
    if (isEmpty(data?.data) && !data?.panels) {
      onChangeBlock(block, setInitialData());
    }
    /* eslint-disable-next-line */
  }, []);

  React.useEffect(() => {
    if (properties?.blocks_layout?.items) {
      properties.blocks_layout.items.map((item) => {
        if (isEmpty(properties.blocks[item]?.blocks)) {
          const updatedData = data.panels
            ? {
                ...data,
                panels: data.panels.map((panel) =>
                  panel['@id'] === item
                    ? { ...panel, ...emptyBlocksForm() }
                    : panel,
                ),
              }
            : {
                ...data,
                data: {
                  ...properties,
                  blocks: {
                    ...properties.blocks,
                    [item]: {
                      ...properties.blocks[item],
                      ...emptyBlocksForm(),
                    },
                  },
                },
              };

          return onChangeBlock(block, updatedData);
        }
        return undefined;
      });
    }
  }, [
    onChangeBlock,
    properties,
    selectedBlock,
    block,
    data,
    properties?.blocks,
  ]);

  const blockState = {};
  const panelData = properties;
  const panels = getPanels(panelData);

  const handleTitleChange = (e, value) => {
    const [uid, panel] = value;

    if (data.panels) {
      // Update new panels structure
      const updatedPanels = data.panels.map((p) =>
        p['@id'] === uid ? { ...p, panel_title: e.target.value } : p,
      );

      onChangeBlock(block, {
        ...data,
        panels: updatedPanels,
      });
    } else {
      // Update old data structure
      const modifiedBlock = {
        ...panel,
        title: e.target.value,
        '@type': 'accordionPanel',
      };

      onChangeBlock(block, {
        ...data,
        data: {
          ...panelData,
          blocks: {
            ...panelData.blocks,
            [uid]: modifiedBlock,
          },
        },
      });
    }
  };

  const handleFilteredValueChange = (value) => {
    setFilterValue(value);
  };

  // Get editing instructions from block settings or props
  let instructions = data?.instructions?.data || data?.instructions;
  if (!instructions || instructions === '<p><br/></p>') {
    instructions = formDescription;
  }

  const changeBlockData = (newBlockData) => {
    if (!currentUid || !properties?.blocks?.[currentUid]) return;

    const selectedIndex =
      properties.blocks[currentUid].blocks_layout.items.indexOf(
        Object.values(selectedBlock)[0],
      ) + 1;
    let pastedBlocks = Object.entries(newBlockData.blocks).filter((block) => {
      let key = block[0];

      return !properties?.blocks[currentUid].blocks_layout.items.find(
        (x) => x === key,
      );
    });

    let blockLayout = pastedBlocks.map((el) => el[0]);

    if (data.panels) {
      // Handle new structure - this is complex, for now just update old structure
      return;
    }

    onChangeBlock(block, {
      ...data,
      data: {
        blocks: {
          ...data.data.blocks,
          [currentUid]: {
            ...data.data.blocks[currentUid],
            ...newBlockData,
            blocks_layout: {
              items: [
                ...data.data.blocks[currentUid].blocks_layout.items.slice(
                  0,
                  selectedIndex,
                ),
                ...blockLayout,
                ...data.data.blocks[currentUid].blocks_layout.items.slice(
                  selectedIndex,
                ),
              ],
            },
          },
        },
        blocks_layout: data.data.blocks_layout,
      },
    });
  };

  const blockConfig = config.blocks.blocksConfig.accordion;
  const blocksConfig = blockConfig.blocksConfig || props.blocksConfig;
  const allowedBlocks = data.allowedBlocks || blockConfig.allowedBlocks;

  const allowedBlocksConfig = allowedBlocks
    ? pickBy(blocksConfig, (value, key) => allowedBlocks.includes(key))
    : blocksConfig;

  const schema = AccordionBlockSchema({ intl, activeObject, setActiveObject });

  return (
    <>
      {data.headline && <h2 className="headline">{data.headline}</h2>}
      <fieldset className="accordion-block">
        <legend
          onClick={() => {
            setSelectedBlock({});
            props.setSidebarTab?.(1);
          }}
          aria-hidden="true"
        >
          {data.title || 'Accordion'}
        </legend>
        {data.filtering && (
          <AccordionFilter
            config={blockConfig}
            data={data}
            filterValue={filterValue}
            handleFilteredValueChange={handleFilteredValueChange}
          />
        )}
        {panels
          .filter(
            (panel) =>
              !data.filtering ||
              filterValue === '' ||
              (filterValue !== '' &&
                (panel[1].title || panel[1].panel_title)
                  ?.toLowerCase()
                  .includes(filterValue.toLowerCase())),
          )
          .map(([uid, panel], index) => (
            <CustomAccordionEdit
              uid={uid}
              panel={panel}
              panelData={panelData}
              handleTitleChange={handleTitleChange}
              handleTitleClick={() => setSelectedBlock({})}
              data={data}
              index={index}
              key={`accordion-${index}`}
              themeStyles={themeStyles}
              getColorValue={getColorValue}
            >
              <BlocksForm
                key={uid}
                title={data.placeholder}
                description={instructions}
                manage={manage}
                blocksConfig={allowedBlocksConfig}
                metadata={metadata}
                properties={
                  data.panels
                    ? isEmpty(panel)
                      ? emptyBlocksForm()
                      : panel
                    : isEmpty(panel)
                      ? emptyBlocksForm()
                      : panel
                }
                selectedBlock={selected ? selectedBlock[uid] : null}
                onSelectBlock={(id, l, e) => {
                  const isMultipleSelection = e
                    ? e.shiftKey || e.ctrlKey || e.metaKey
                    : false;
                  onSelectBlock(uid, id, isMultipleSelection, e, selectedBlock);
                }}
                onChangeFormData={(newFormData) => {
                  if (data.panels) {
                    // For new panels structure, we need to update the panel's block content
                    // Find the panel and update its blocks
                    const updatedPanels = data.panels.map((panel) => {
                      if (panel['@id'] === uid) {
                        return {
                          ...panel,
                          ...newFormData,
                        };
                      }
                      return panel;
                    });

                    onChangeBlock(block, {
                      ...data,
                      panels: updatedPanels,
                    });
                  } else {
                    onChangeBlock(block, {
                      ...data,
                      data: {
                        ...panelData,
                        blocks: {
                          ...panelData.blocks,
                          [uid]: newFormData,
                        },
                      },
                    });
                  }
                }}
                onChangeField={(id, value) => {
                  if (['blocks', 'blocks_layout'].indexOf(id) > -1) {
                    blockState[id] = value;
                    if (data.panels) {
                      // For new panels structure, update the specific panel
                      const updatedPanels = data.panels.map((panel) => {
                        if (panel['@id'] === uid) {
                          return {
                            ...panel,
                            ...blockState,
                            [id]: value,
                          };
                        }
                        return panel;
                      });

                      onChangeBlock(block, {
                        ...data,
                        panels: updatedPanels,
                      });
                    } else {
                      onChangeBlock(block, {
                        ...data,
                        data: {
                          ...panelData,
                          blocks: {
                            ...panelData.blocks,
                            [uid]: {
                              ...panelData.blocks?.[uid],
                              ...blockState,
                              [id]: value,
                            },
                          },
                        },
                      });
                    }
                  } else {
                    onChangeField?.(id, value);
                  }
                }}
                pathname={pathname}
              >
                {({ draginfo }, editBlock, blockProps) => {
                  return (
                    <EditBlockWrapper
                      draginfo={draginfo}
                      blockProps={blockProps}
                      disabled={data.disableInnerButtons}
                      multiSelected={searchElementInMultiSelection(
                        uid,
                        blockProps,
                      )}
                      extraControls={
                        <>
                          {instructions && (
                            <>
                              <Button
                                icon
                                basic
                                title={intl.formatMessage(messages.SectionHelp)}
                                onClick={() => {
                                  setSelectedBlock({});
                                  const tab = manage ? 0 : 1;
                                  props.setSidebarTab?.(tab);
                                }}
                              >
                                <Icon name={helpSVG} className="" size="19px" />
                              </Button>
                            </>
                          )}
                        </>
                      }
                    >
                      {editBlock}
                    </EditBlockWrapper>
                  );
                }}
              </BlocksForm>
            </CustomAccordionEdit>
          ))}
        {selected ? (
          <BlocksToolbar
            selectedBlock={Object.keys(selectedBlock)[0]}
            formData={properties?.blocks?.[currentUid]}
            selectedBlocks={multiSelected}
            onSetSelectedBlocks={(blockIds) => {
              setMultiSelected(blockIds);
            }}
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

        <SidebarPortal
          selected={selected && !Object.keys(selectedBlock).length}
        >
          {instructions && (
            <Segment attached>
              <div dangerouslySetInnerHTML={{ __html: instructions }} />
            </Segment>
          )}
          {!data?.readOnlySettings && (
            <BlockDataForm
              schema={schema}
              title={schema.title}
              onChangeField={(id, value) => {
                onChangeBlock(block, {
                  ...data,
                  [id]: value,
                });
              }}
              formData={data}
              block={block}
              blocksConfig={blocksConfig}
              onChangeBlock={onChangeBlock}
            />
          )}
        </SidebarPortal>
      </fieldset>
    </>
  );
};

export default withBlockExtensions(Edit);
