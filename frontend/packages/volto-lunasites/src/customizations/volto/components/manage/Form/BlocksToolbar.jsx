import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { messages } from '@plone/volto/helpers/MessageLabels/MessageLabels';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers/Blocks/Blocks';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import { Plug } from '@plone/volto/components/manage/Pluggable';
import { v4 as uuid } from 'uuid';
import { load } from 'redux-localstorage-simple';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import without from 'lodash/without';
import { toast } from 'react-toastify';

import {
  setBlocksClipboard,
  resetBlocksClipboard,
} from '@plone/volto/actions/blocksClipboard/blocksClipboard';
import config from '@plone/volto/registry';

import copySVG from '@plone/volto/icons/copy.svg';
import cutSVG from '@plone/volto/icons/cut.svg';
import pasteSVG from '@plone/volto/icons/paste.svg';
import trashSVG from '@plone/volto/icons/delete.svg';
import { cloneBlocks } from '@plone/volto/helpers/Blocks/cloneBlocks';

export class BlocksToolbarComponent extends React.Component {
  constructor(props) {
    super(props);

    this.copyBlocksToClipboard = this.copyBlocksToClipboard.bind(this);
    this.cutBlocksToClipboard = this.cutBlocksToClipboard.bind(this);
    this.deleteBlocks = this.deleteBlocks.bind(this);
    this.loadFromStorage = this.loadFromStorage.bind(this);
    this.pasteBlocks = this.pasteBlocks.bind(this);
    this.setBlocksClipboard = this.setBlocksClipboard.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  loadFromStorage() {
    const clipboard = load({ states: ['blocksClipboard'] })?.blocksClipboard;
    if (!isEqual(clipboard, this.props.blocksClipboard))
      this.props.setBlocksClipboard(clipboard || {});
  }

  componentDidMount() {
    window.addEventListener('storage', this.loadFromStorage, true);
    // Add keyboard shortcut listener
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.loadFromStorage);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    // Check if we're in an input field or textarea
    const target = e.target;
    const isInputField = 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.contentEditable === 'true';
    
    // Don't handle shortcuts if we're typing in a field
    if (isInputField && target.getAttribute('role') !== 'textbox') {
      return;
    }

    const { selectedBlock, selectedBlocks, blocksClipboard = {} } = this.props;
    const hasSelection = selectedBlocks.length > 0 || selectedBlock;
    const hasClipboard = blocksClipboard?.cut || blocksClipboard?.copy;

    // Handle keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      switch(e.key.toLowerCase()) {
        case 'c':
          if (hasSelection) {
            e.preventDefault();
            this.copyBlocksToClipboard();
            toast.success('Block(s) copied to clipboard');
          }
          break;
        case 'x':
          if (hasSelection) {
            e.preventDefault();
            this.cutBlocksToClipboard();
            toast.success('Block(s) cut to clipboard');
          }
          break;
        case 'v':
          if (hasClipboard && selectedBlock) {
            e.preventDefault();
            this.pasteBlocks(e);
            toast.success('Block(s) pasted');
          }
          break;
        default:
          break;
      }
    }
  }

  getSelectedBlockIds() {
    const { selectedBlocks, selectedBlock } = this.props;
    // If we have multi-selected blocks, use those
    if (selectedBlocks.length > 0) {
      return selectedBlocks;
    }
    // If we have a single selected block, use that
    if (selectedBlock) {
      return [selectedBlock];
    }
    return [];
  }

  deleteBlocks() {
    const blockIds = this.getSelectedBlockIds();
    
    if (blockIds.length === 0) {
      return;
    }

    const { formData } = this.props;
    const blocksFieldname = getBlocksFieldname(formData);
    const blocksLayoutFieldname = getBlocksLayoutFieldname(formData);

    // Might need ReactDOM.unstable_batchedUpdates()
    this.props.onSelectBlock(null);
    const newBlockData = {
      [blocksFieldname]: omit(formData[blocksFieldname], blockIds),
      [blocksLayoutFieldname]: {
        ...formData[blocksLayoutFieldname],
        items: without(formData[blocksLayoutFieldname].items, ...blockIds),
      },
    };
    this.props.onChangeBlocks(newBlockData);
  }

  copyBlocksToClipboard() {
    this.setBlocksClipboard('copy');
  }

  cutBlocksToClipboard() {
    this.setBlocksClipboard('cut');
    this.deleteBlocks();
  }

  setBlocksClipboard(actionType) {
    const { formData } = this.props;
    const blocksFieldname = getBlocksFieldname(formData);
    const blocks = formData[blocksFieldname];
    
    const blockIds = this.getSelectedBlockIds();
    if (blockIds.length === 0) {
      return;
    }

    const blocksData = blockIds
      .map((blockId) => [blockId, blocks[blockId]])
      .filter(([blockId]) => !!blockId); // Removes null blocks
    
    this.props.setBlocksClipboard({ [actionType]: blocksData });
    
    // Only clear multi-selection, keep single selection
    if (this.props.selectedBlocks.length > 0) {
      this.props.onSetSelectedBlocks([]);
    }
  }

  pasteBlocks(e) {
    const { formData, blocksClipboard = {}, selectedBlock } = this.props;
    const mode = Object.keys(blocksClipboard).includes('cut') ? 'cut' : 'copy';
    const blocksData = blocksClipboard[mode] || [];
    const cloneWithIds = blocksData
      .filter(([blockId, blockData]) => blockId && !!blockData['@type']) // Removes null blocks
      .map(([blockId, blockData]) => {
        const blockConfig = config.blocks.blocksConfig[blockData['@type']];
        return mode === 'copy'
          ? blockConfig.cloneData
            ? blockConfig.cloneData(blockData)
            : [uuid(), cloneBlocks(blockData)]
          : [blockId, blockData]; // if cut/pasting blocks, we don't clone
      })
      .filter((info) => !!info); // some blocks may refuse to be copied
    const blocksFieldname = getBlocksFieldname(formData);
    const blocksLayoutFieldname = getBlocksLayoutFieldname(formData);
    const selectedIndex =
      formData[blocksLayoutFieldname].items.indexOf(selectedBlock) + 1;

    const newBlockData = {
      [blocksFieldname]: {
        ...formData[blocksFieldname],
        ...Object.assign(
          {},
          ...cloneWithIds.map(([id, data]) => ({ [id]: data })),
        ),
      },
      [blocksLayoutFieldname]: {
        ...formData[blocksLayoutFieldname],
        items: [
          ...formData[blocksLayoutFieldname].items.slice(0, selectedIndex),
          ...cloneWithIds.map(([id]) => id),
          ...formData[blocksLayoutFieldname].items.slice(selectedIndex),
        ],
      },
    };

    if (!(e.ctrlKey || e.metaKey)) this.props.resetBlocksClipboard();
    this.props.onChangeBlocks(newBlockData);
  }

  render() {
    const {
      blocksClipboard = {},
      selectedBlock,
      selectedBlocks,
      intl,
    } = this.props;
    
    // Check if we have any selection (multi-select or single select)
    const hasSelection = selectedBlocks.length > 0 || selectedBlock;
    const blockCount = selectedBlocks.length > 0 ? selectedBlocks.length : (selectedBlock ? 1 : 0);
    
    return (
      <>
        {hasSelection ? (
          <>
            <Plug pluggable="main.toolbar.bottom" id="blocks-delete-btn">
              <button
                aria-label={intl.formatMessage(messages.deleteBlocks)}
                onClick={this.deleteBlocks}
                tabIndex={0}
                className="deleteBlocks"
                id="toolbar-delete-blocks"
                title={`Delete ${blockCount} block${blockCount > 1 ? 's' : ''} (Del)`}
              >
                <Icon name={trashSVG} size="30px" />
              </button>
            </Plug>
            <Plug pluggable="main.toolbar.bottom" id="blocks-cut-btn">
              <button
                aria-label={intl.formatMessage(messages.cutBlocks)}
                onClick={this.cutBlocksToClipboard}
                tabIndex={0}
                className="cutBlocks"
                id="toolbar-cut-blocks"
                title={`Cut ${blockCount} block${blockCount > 1 ? 's' : ''} (Ctrl+X)`}
              >
                <Icon name={cutSVG} size="30px" />
              </button>
            </Plug>
            <Plug pluggable="main.toolbar.bottom" id="blocks-copy-btn">
              <button
                aria-label={intl.formatMessage(messages.copyBlocks)}
                onClick={this.copyBlocksToClipboard}
                tabIndex={0}
                className="copyBlocks"
                id="toolbar-copy-blocks"
                title={`Copy ${blockCount} block${blockCount > 1 ? 's' : ''} (Ctrl+C)`}
              >
                <Icon name={copySVG} size="30px" />
              </button>
            </Plug>
          </>
        ) : (
          ''
        )}
        {selectedBlock && (blocksClipboard?.cut || blocksClipboard?.copy) && (
          <Plug
            pluggable="main.toolbar.bottom"
            id="block-paste-btn"
            dependencies={[selectedBlock]}
          >
            <button
              aria-label={intl.formatMessage(messages.pasteBlocks)}
              onClick={this.pasteBlocks}
              tabIndex={0}
              className="pasteBlocks"
              id="toolbar-paste-blocks"
              title={`Paste ${(blocksClipboard.cut || blocksClipboard.copy).length} block${(blocksClipboard.cut || blocksClipboard.copy).length > 1 ? 's' : ''} (Ctrl+V)`}
            >
              <span className="blockCount">
                {(blocksClipboard.cut || blocksClipboard.copy).length}
              </span>
              <Icon name={pasteSVG} size="30px" />
            </button>
          </Plug>
        )}
      </>
    );
  }
}

export default compose(
  injectIntl,
  connect(
    (state) => {
      return {
        blocksClipboard: state?.blocksClipboard || {},
        selectedBlock: state?.form?.ui?.selected,
      };
    },
    { setBlocksClipboard, resetBlocksClipboard },
  ),
)(BlocksToolbarComponent);