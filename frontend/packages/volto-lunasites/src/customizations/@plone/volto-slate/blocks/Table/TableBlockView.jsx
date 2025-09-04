import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Table } from 'semantic-ui-react';
import cx from 'classnames';
import map from 'lodash/map';

import { serializeNodesToText } from '@plone/volto-slate/editor/render';

/**
 * View component for the Slate Table block type in Volto.
 */
const TableBlockView = ({ data, ...props }) => {
  const lunaTheming = useSelector((state) => state.lunaTheming);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Get table theme variations
  const getTableThemeStyles = () => {
    const colors = lunaTheming?.data?.colors || {};
    const getColorValue = (colorKey) => {
      if (colorKey === 'transparent') return 'transparent';
      return colors[colorKey] || '#666666';
    };

    const tableVariations = {
      primary_table: {
        headerBg: 'primary_color',
        headerText: 'tertiary_color',
        cellBg: 'background_color',
        cellText: 'neutral_color',
        borderColor: 'primary_color',
      },
      neutral_table: {
        headerBg: 'neutral_color',
        headerText: 'tertiary_color',
        cellBg: 'background_color',
        cellText: 'neutral_color',
        borderColor: 'neutral_color',
      },
      minimal_table: {
        headerBg: 'background_color',
        headerText: 'neutral_color',
        cellBg: 'background_color',
        cellText: 'neutral_color',
        borderColor: 'neutral_color',
      },
      secondary_table: {
        headerBg: 'secondary_color',
        headerText: 'tertiary_color',
        cellBg: 'background_color',
        cellText: 'neutral_color',
        borderColor: 'secondary_color',
      },
    };

    const currentTheme = data.table?.table_theme || 'primary_table';
    const themeStyles =
      tableVariations[currentTheme] || tableVariations.primary_table;

    return {
      headerStyle: {
        backgroundColor: getColorValue(themeStyles.headerBg),
        color: getColorValue(themeStyles.headerText),
        borderColor: getColorValue(themeStyles.borderColor),
      },
      cellStyle: {
        backgroundColor: getColorValue(themeStyles.cellBg),
        color: getColorValue(themeStyles.cellText),
        borderColor: getColorValue(themeStyles.borderColor),
      },
      stripedStyle: {
        backgroundColor: getColorValue(themeStyles.headerBg) + '20', // Use header background with low opacity
        color: getColorValue(themeStyles.cellText),
        borderColor: getColorValue(themeStyles.borderColor),
      },
      tableStyle: {
        borderColor: getColorValue(themeStyles.borderColor),
      },
    };
  };

  const themeStyles = getTableThemeStyles();

  if (!data?.table?.rows) {
    return <div />;
  }

  const headers = data.table.rows?.[0]?.cells || [];
  let rows = data.table.rows?.filter((_, index) => index > 0) || [];

  // Sort rows if sorting is active
  if (data.table.sortable && sortConfig.key !== null) {
    rows = [...rows].sort((a, b) => {
      const aValue = serializeNodesToText(a.cells[sortConfig.key]?.value || []);
      const bValue = serializeNodesToText(b.cells[sortConfig.key]?.value || []);
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const handleSort = (columnIndex) => {
    if (!data.table.sortable) return;
    
    let direction = 'ascending';
    if (sortConfig.key === columnIndex && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: columnIndex, direction });
  };

  return (
    <div className={cx('block table slate-table-block-view')}>
      <Table
        fixed={data.table.fixed}
        compact={data.table.compact}
        celled={data.table.celled}
        striped={false}
        className="slate-table-block"
        style={themeStyles.tableStyle}
      >
        {!data.table.hideHeaders ? (
          <Table.Header>
            <Table.Row textAlign="left">
              {headers.map((cell, cellIndex) => (
                <Table.HeaderCell
                  key={cell.key}
                  textAlign="left"
                  verticalAlign="middle"
                  style={{
                    ...themeStyles.headerStyle,
                    cursor: data.table.sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => handleSort(cellIndex)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{serializeNodesToText(cell.value || [])}</span>
                    {data.table.sortable && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                        {sortConfig.key === cellIndex
                          ? sortConfig.direction === 'ascending'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    )}
                  </div>
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
        ) : null}
        <Table.Body>
          {map(rows, (row, rowIndex) => (
            <Table.Row key={row.key}>
              {map(row.cells, (cell) => (
                <Table.Cell
                  key={cell.key}
                  textAlign="left"
                  verticalAlign="middle"
                  style={
                    data.table.striped && rowIndex % 2 === 1
                      ? themeStyles.stripedStyle
                      : themeStyles.cellStyle
                  }
                >
                  {serializeNodesToText(cell.value || [])}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

TableBlockView.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default TableBlockView;
