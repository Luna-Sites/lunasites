import React from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { compose } from 'redux';
import { Grid } from 'semantic-ui-react';
import { isEmpty, without, map } from 'lodash';
import {
  SidebarPortal,
  BlocksToolbar,
  BlockDataForm,
  BlocksForm,
} from '@plone/volto/components';
import {
  emptyBlocksForm,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { setSidebarTab } from '@plone/volto/actions';
import { connect } from 'react-redux';
import config from '@plone/volto/registry';
import cx from 'classnames';
import { v4 as uuid } from 'uuid';

import { ColumnsBlockSchema } from './schema';
import {
  columnIsEmpty,
  defaultNewColumn,
} from '@eeacms/volto-columns-block/ColumnsBlock/utils';
import ColumnVariations from '@eeacms/volto-columns-block/ColumnsBlock/ColumnVariations';
import EditBlockWrapper from '@eeacms/volto-columns-block/ColumnsBlock/EditBlockWrapper';

import { COLUMNSBLOCK } from '@eeacms/volto-columns-block/constants';
import { getStyle } from '@eeacms/volto-columns-block/Styles';

import '@eeacms/volto-columns-block/less/columns.less';
import { getInlineStyles } from 'lunasites-advanced-styling/StyleWrapper/StyleWrapperView';

const messages = defineMessages({
  labelColumn: {
    id: 'Column',
    defaultMessage: 'Column',
  },
  labelColumnsBlock: {
    id: 'Columns block',
    defaultMessage: 'Columns block',
  },
  labelToColSettings: {
    id: 'Go to Column settings',
    defaultMessage: 'Go to Column settings',
  },
});

class ColumnsBlockEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      multiSelected: [],
      colSelections: {}, // selected block for each column
      showSidebar: false,
      activeColumn: null,
      activeObject: 0,
    };
    this.blocksState = {};
  }

  createFrom = (initialData) => {
    const { gridCols, gridSize } = initialData;
    const columns = map(Array(gridCols.length), () => ({
      '@id': uuid(),
      ...emptyBlocksForm(),
    }));
    return {
      columns,
      gridSize,
      gridCols,
    };
  };

  handleKeyDown = (
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
    const hasblockActive = Object.keys(this.state.colSelections).length > 0;
    if (e.key === 'ArrowUp' && !disableArrowUp && !hasblockActive) {
      this.props.onFocusPreviousBlock(block, node);
      e.preventDefault();
    }
    if (e.key === 'ArrowDown' && !disableArrowDown && !hasblockActive) {
      this.props.onFocusNextBlock(block, node);
      e.preventDefault();
    }
    if (e.key === 'Enter' && !disableEnter && !hasblockActive) {
      this.props.onAddBlock(config.settings.defaultBlockType, index + 1);
      e.preventDefault();
    }
  };

  onChangeColumnData = (id, value, colId) => {
    const { data, onChangeBlock, block, onChangeField } = this.props;
    const columns = data.columns;
    if (['blocks', 'blocks_layout'].indexOf(id) > -1) {
      this.blocksState[id] = value;
      const newColumns = columns.map((col) => {
        if (col['@id'] === colId) {
          return {
            ...col,
            ...this.blocksState,
          };
        }
        return col;
      });
      onChangeBlock(block, {
        ...data,
        columns: newColumns,
      });
    } else {
      onChangeField(id, value);
    }
  };

  onSelectBlock = (
    id,
    colId,
    colData,
    activeBlock,
    isMultipleSelection,
    event,
  ) => {
    let newMultiSelected = [];
    let selected = id;

    if (isMultipleSelection) {
      selected = null;
      const blocksLayoutFieldname = getBlocksLayoutFieldname(colData);
      const blocks_layout = colData[blocksLayoutFieldname].items;

      if (event.shiftKey) {
        const anchor =
          this.state.multiSelected.length > 0
            ? blocks_layout.indexOf(this.state.multiSelected[0])
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
        if (this.state.multiSelected.includes(id)) {
          selected = null;
          newMultiSelected = without(this.state.multiSelected, id);
        } else {
          newMultiSelected = [...(this.state.multiSelected || []), id];
        }
      }
    }

    this.setState({
      multiSelected: newMultiSelected,
      colSelections: {
        [colId]: selected,
      },
    });
  };

  getColumnsBlockSchema = () => {
    const { intl, data } = this.props;
    const { activeObject } = this.state;
    const schema = ColumnsBlockSchema({
      intl,
      activeObject,
      setActiveObject: (obj) => this.setState({ activeObject: obj }),
    });
    const variants = config.blocks.blocksConfig?.[COLUMNSBLOCK]?.variants || [];
    const nrOfColumns = (data.columns || []).length;
    const available_variants = variants.filter(
      ({ defaultData }) => defaultData?.gridCols?.length === nrOfColumns,
    );

    schema.properties.gridCols.choices = available_variants.map(
      ({ defaultData, title }) => [defaultData?.gridCols, title],
    );
    return schema;
  };

  componentDidUpdate(prevProps) {
    const { data, onChangeBlock, block } = this.props;
    const variants = config.blocks.blocksConfig?.[COLUMNSBLOCK]?.variants || [];
    const cols = data.columns || [];
    const prevCols = prevProps.data.columns || [];

    const colNumChanged = cols.length !== prevCols.length;
    const initialLayoutSelection = prevCols.length === 0;
    const shouldUpdateLayout = colNumChanged && !initialLayoutSelection;

    if (shouldUpdateLayout) {
      const available_variants = variants.filter(
        ({ defaultData }) => defaultData?.gridCols?.length === cols.length,
      );
      const variant = available_variants?.[0];
      if (variant && variant.defaultData) {
        return onChangeBlock(block, {
          ...data,
          gridSize: variant.defaultData.gridSize,
          gridCols: variant.defaultData.gridCols,
        });
      }
    }

    if (data.columns) {
      data.columns.forEach((col) => {
        if (columnIsEmpty(col)) {
          const newColumns = data.columns.map((c) => {
            if (c['@id'] === col['@id']) {
              return {
                ...c,
                ...defaultNewColumn(),
              };
            }
            return c;
          });
          onChangeBlock(block, {
            ...data,
            columns: newColumns,
          });
        }
      });
    }
  }

  render() {
    const { block, data, onChangeBlock, pathname, selected, manage } =
      this.props;
    const metadata = this.props.metadata || this.props.properties;
    const { columns = [], gridCols, gridSize } = data;
    const selectedCol =
      Object.keys(this.state.colSelections).length > 0
        ? Object.keys(this.state.colSelections)[0]
        : null;
    const selectedColData = columns.find((col) => col['@id'] === selectedCol);
    const selectedBlock = this.state.colSelections[selectedCol];

    const { gridSizes, variants } = config.blocks.blocksConfig[COLUMNSBLOCK];
    const isInitialized = data?.columns && data?.columns?.length > 0;

    return (
      <div
        role="presentation"
        className="columns-block"
        onKeyDown={(e) => {
          this.handleKeyDown(
            e,
            this.props.index,
            this.props.block,
            this.props.blockNode.current,
          );
        }}
        tabIndex={-1}
      >
        {!isInitialized ? (
          <ColumnVariations
            variants={variants.filter((variant) => variant.common)}
            onChange={(initialData) => {
              onChangeBlock(block, {
                ...data,
                ...this.createFrom(initialData),
              });
            }}
          />
        ) : (
          <>
            <div
              className="columns-header"
              onClick={() => {
                this.setState({
                  showSidebar: true,
                  colSelections: {},
                });
                this.props.setSidebarTab(1);
              }}
              aria-hidden="true"
            >
              {data.title || (
                <FormattedMessage
                  id="Columns block"
                  defaultMessage="Columns block"
                />
              )}
            </div>
            <Grid columns={gridSize} className="column-grid" stackable>
              {columns.map((column, index) => {
                return (
                  <Grid.Column
                    className={cx('block-column', column.column_class)}
                    key={column['@id']}
                    {...(gridSizes[gridCols[index]] || gridCols[index])}
                    style={getInlineStyles(column, this.props, true)}
                  >
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent:
                          column.grid_vertical_align === 'middle'
                            ? 'center'
                            : column.grid_vertical_align === 'bottom'
                              ? 'flex-end'
                              : 'flex-start',
                      }}
                    >
                      <BlocksForm
                        errors={this.props.errors}
                        key={column['@id']}
                        title={data?.placeholder}
                        description={data?.instructions?.data}
                        manage={manage}
                        allowedBlocks={data?.allowedBlocks}
                        metadata={metadata}
                        properties={{
                          ...metadata,
                          ...(isEmpty(column)
                            ? emptyBlocksForm()
                            : { ...emptyBlocksForm(), ...column }),
                        }}
                        disableEvents={true}
                        selectedBlock={
                          selected
                            ? this.state.colSelections[column['@id']]
                            : null
                        }
                        onSelectBlock={(id, selected, e) => {
                          const isMultipleSelection = e
                            ? e.shiftKey || e.ctrlKey || e.metaKey
                            : false;
                          this.onSelectBlock(
                            id,
                            column['@id'],
                            selectedColData,
                            selectedBlock,
                            selectedCol !== column['@id'] ||
                              selectedBlock === id
                              ? false
                              : isMultipleSelection,
                            e,
                          );
                        }}
                        onChangeFormData={(newFormData) => {
                          const newColumns = columns.map((c) => {
                            if (c['@id'] === column['@id']) {
                              return {
                                ...c,
                                ...newFormData,
                              };
                            }
                            return c;
                          });
                          onChangeBlock(block, {
                            ...data,
                            columns: newColumns,
                          });
                        }}
                        onChangeField={(id, value) =>
                          this.onChangeColumnData(id, value, column['@id'])
                        }
                        pathname={pathname}
                      >
                        {({ draginfo }, editBlock, blockProps) => (
                          <EditBlockWrapper
                            draginfo={draginfo}
                            blockProps={blockProps}
                            multiSelected={this.state.multiSelected.includes(
                              blockProps.block,
                            )}
                          >
                            {editBlock}
                          </EditBlockWrapper>
                        )}
                      </BlocksForm>
                    </div>
                  </Grid.Column>
                );
              })}
            </Grid>
          </>
        )}

        {Object.keys(this.state.colSelections).length === 0 &&
        !data?.readOnlySettings ? (
          <SidebarPortal selected={selected}>
            <BlockDataForm
              schema={this.getColumnsBlockSchema()}
              title={this.props.intl.formatMessage(messages.labelColumnsBlock)}
              onChangeField={(id, value) => {
                onChangeBlock(block, {
                  ...data,
                  [id]: value,
                });
              }}
              formData={data}
            />
          </SidebarPortal>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default compose(
  injectIntl,
  connect(
    (state, props) => {
      return {};
    },
    { setSidebarTab },
  ),
)(ColumnsBlockEdit);
