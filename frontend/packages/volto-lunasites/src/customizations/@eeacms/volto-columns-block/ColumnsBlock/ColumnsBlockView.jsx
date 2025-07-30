import React from 'react';
import { useLocation } from 'react-router-dom';
import config from '@plone/volto/registry';
import { Grid } from 'semantic-ui-react';
import { RenderBlocks } from '@plone/volto/components';
import { COLUMNSBLOCK } from '@eeacms/volto-columns-block/constants';
import cx from 'classnames';
import { getInlineStyles } from 'lunasites-advanced-styling/StyleWrapper/StyleWrapperView';

import { getColumns } from '@eeacms/volto-columns-block/ColumnsBlock/utils';
import { getStyle } from '@eeacms/volto-columns-block/Styles';

const ColumnsBlockView = (props) => {
  const location = useLocation();
  const { gridSizes } = config.blocks.blocksConfig[COLUMNSBLOCK];
  const { gridSize = 12, gridCols = [] } = props.data;
  const data = props.data;
  const metadata = props.metadata || props.properties;
  const columnList = data?.columns || [];
  const customId = props.data?.title
    ?.toLowerCase()
    ?.replace(/[^a-zA-Z-\s]/gi, '')
    ?.trim()
    ?.replace(/\s+/gi, '-');

  return (
    <div className="columns-view" id={customId}>
      <Grid
        columns={gridSize}
        className={
          props?.data?.reverseWrap ? 'column-grid reverse-wrap' : 'column-grid'
        }
      >
        {columnList.map((column, index) => {
          const columnSettings = column?.settings || {};
          const verticalAlign = column.grid_vertical_align || 'top';
          const advancedStyling = columnSettings.advanced_styling || {};
          console.log({ column });
          return (
            <Grid.Column
              key={column.id}
              {...(gridSizes[gridCols[index]] || gridCols[index])}
              className={cx('column-blocks-wrapper', {
                'vertical-align-top': verticalAlign === 'top',
                'vertical-align-middle': verticalAlign === 'middle',
                'vertical-align-bottom': verticalAlign === 'bottom',
              })}
              style={getInlineStyles(column, props, true)}
            >
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent:
                    verticalAlign === 'middle'
                      ? 'center'
                      : verticalAlign === 'bottom'
                        ? 'flex-end'
                        : 'flex-start',
                }}
              >
                <RenderBlocks
                  {...props}
                  location={location}
                  metadata={metadata}
                  content={{
                    blocks: column.blocks,
                    blocks_layout: column.blocks_layout,
                  }}
                />
              </div>
            </Grid.Column>
          );
        })}
      </Grid>
    </div>
  );
};

export default ColumnsBlockView;
