import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import cx from 'classnames';
import {
  setBlocksClipboard,
  resetBlocksClipboard,
} from '@plone/volto/actions/blocksClipboard/blocksClipboard';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { cloneBlocks } from '@plone/volto/helpers/Blocks/cloneBlocks';
import { setFormData } from '@plone/volto/actions/form/form';
import { v4 as uuid } from 'uuid';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import copySVG from '@plone/volto/icons/copy.svg';
import cutSVG from '@plone/volto/icons/cut.svg';
import pasteSVG from '@plone/volto/icons/paste.svg';
import { defineMessages, useIntl } from 'react-intl';

import './BlockCopyPasteToolbarButtons.css';

const messages = defineMessages({
  copyBlocks: {
    id: 'Copy blocks',
    defaultMessage: 'Copy blocks',
  },
  cutBlocks: {
    id: 'Cut blocks',
    defaultMessage: 'Cut blocks',
  },
  pasteBlocks: {
    id: 'Paste blocks',
    defaultMessage: 'Paste blocks',
  },
  noBlocksSelected: {
    id: 'No blocks selected',
    defaultMessage: 'No blocks selected',
  },
  clipboardEmpty: {
    id: 'Clipboard is empty',
    defaultMessage: 'Clipboard is empty',
  },
  copiedBlocks: {
    id: 'Copied {count} block(s)',
    defaultMessage: 'Copied {count} block(s)',
  },
  cutBlocksMsg: {
    id: 'Cut {count} block(s)',
    defaultMessage: 'Cut {count} block(s)',
  },
  pastedBlocks: {
    id: 'Pasted {count} block(s)',
    defaultMessage: 'Pasted {count} block(s)',
  },
});

const BlockCopyPasteToolbarButtons = (props) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  
  // Get Redux state
  const formData = useSelector((state) => state?.form?.formData);
  const selectedBlocks = useSelector((state) => state?.form?.ui?.multiSelected || []);
  const selectedBlock = useSelector((state) => state?.form?.ui?.selected);
  const blocksClipboard = useSelector((state) => state.blocksClipboard || {});
  const pathname = useSelector((state) => state.router?.location?.pathname);
  
  // Check if we're in edit mode
  const isEditMode = pathname?.endsWith('/edit') || pathname?.includes('/edit');
  
  if (!isEditMode || !formData) {
    return null;
  }
  
  const blocksFieldname = getBlocksFieldname(formData);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(formData);
  
  // Determine if we have any blocks selected
  const hasSelection = selectedBlocks.length > 0 || selectedBlock;
  const hasClipboard = blocksClipboard?.copy?.length > 0 || blocksClipboard?.cut?.length > 0;

  const copyBlocks = () => {
    const blocks = formData?.[blocksFieldname] || {};
    const blocksToCopy = selectedBlocks.length > 0 
      ? selectedBlocks 
      : selectedBlock 
        ? [selectedBlock] 
        : [];

    if (blocksToCopy.length === 0) {
      toast.warning(intl.formatMessage(messages.noBlocksSelected));
      return;
    }

    const copiedBlocks = blocksToCopy
      .filter((blockId) => blocks[blockId])
      .map((blockId) => [blockId, blocks[blockId]]);

    if (copiedBlocks.length > 0) {
      dispatch(setBlocksClipboard({ copy: copiedBlocks }));
      
      // Sync to localStorage for cross-tab support
      window.localStorage.setItem(
        'volto:blocksClipboard',
        JSON.stringify({ copy: copiedBlocks }),
      );

      toast.success(
        intl.formatMessage(messages.copiedBlocks, { count: copiedBlocks.length })
      );
    }
  };

  const cutBlocks = () => {
    const blocks = formData?.[blocksFieldname] || {};
    const blocks_layout = formData?.[blocksLayoutFieldname] || {};
    
    const blocksToCut = selectedBlocks.length > 0 
      ? selectedBlocks 
      : selectedBlock 
        ? [selectedBlock] 
        : [];

    if (blocksToCut.length === 0) {
      toast.warning(intl.formatMessage(messages.noBlocksSelected));
      return;
    }

    const cutBlocksData = blocksToCut
      .filter((blockId) => blocks[blockId])
      .map((blockId) => [blockId, blocks[blockId]]);

    if (cutBlocksData.length > 0) {
      dispatch(setBlocksClipboard({ cut: cutBlocksData }));
      
      window.localStorage.setItem(
        'volto:blocksClipboard',
        JSON.stringify({ cut: cutBlocksData }),
      );

      // Remove cut blocks from the form
      const newBlocks = { ...blocks };
      const newBlocksLayout = { ...blocks_layout };
      
      blocksToCut.forEach((blockId) => {
        delete newBlocks[blockId];
        const index = newBlocksLayout.items?.indexOf(blockId);
        if (index > -1) {
          newBlocksLayout.items.splice(index, 1);
        }
      });

      dispatch(setFormData({
        ...formData,
        [blocksFieldname]: newBlocks,
        [blocksLayoutFieldname]: newBlocksLayout,
      }));

      toast.success(
        intl.formatMessage(messages.cutBlocksMsg, { count: cutBlocksData.length })
      );
    }
  };

  const pasteBlocks = () => {
    const blocks = formData?.[blocksFieldname] || {};
    const blocks_layout = formData?.[blocksLayoutFieldname] || {};
    
    let clipboardData = blocksClipboard;
    
    if (!clipboardData?.copy?.length && !clipboardData?.cut?.length) {
      const stored = window.localStorage.getItem('volto:blocksClipboard');
      if (stored) {
        try {
          clipboardData = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse clipboard data', e);
          return;
        }
      }
    }

    const mode = clipboardData?.cut?.length > 0 ? 'cut' : 'copy';
    const blocksData = clipboardData[mode];

    if (!blocksData?.length) {
      toast.info(intl.formatMessage(messages.clipboardEmpty));
      return;
    }

    const targetBlock = selectedBlock || blocks_layout.items?.[blocks_layout.items.length - 1];
    const targetIndex = targetBlock 
      ? blocks_layout.items?.indexOf(targetBlock) 
      : blocks_layout.items?.length - 1;

    const newBlocks = { ...blocks };
    const newBlocksLayout = { ...blocks_layout };
    const newIds = [];

    if (mode === 'copy') {
      const clonedBlocks = cloneBlocks(blocksData);
      
      clonedBlocks.forEach(([, blockData], index) => {
        const newId = uuid();
        newIds.push(newId);
        newBlocks[newId] = blockData;
        
        const insertIndex = targetIndex + 1 + index;
        newBlocksLayout.items.splice(insertIndex, 0, newId);
      });
    } else {
      blocksData.forEach(([blockId, blockData], index) => {
        newIds.push(blockId);
        newBlocks[blockId] = blockData;
        
        const insertIndex = targetIndex + 1 + index;
        newBlocksLayout.items.splice(insertIndex, 0, blockId);
      });
      
      dispatch(resetBlocksClipboard());
      window.localStorage.removeItem('volto:blocksClipboard');
    }

    dispatch(setFormData({
      ...formData,
      [blocksFieldname]: newBlocks,
      [blocksLayoutFieldname]: newBlocksLayout,
    }));

    toast.success(
      intl.formatMessage(messages.pastedBlocks, { count: newIds.length })
    );
  };

  return (
    <div className="block-copy-paste-toolbar-buttons">
      <div className="toolbar-divider" />
      
      <button
        className={cx('toolbar-button', { disabled: !hasSelection })}
        onClick={copyBlocks}
        disabled={!hasSelection}
        title={intl.formatMessage(messages.copyBlocks) + (hasSelection ? '' : ' - Select blocks first')}
        aria-label={intl.formatMessage(messages.copyBlocks)}
        tabIndex={0}
      >
        <Icon name={copySVG} size="30px" />
      </button>
      
      <button
        className={cx('toolbar-button', { disabled: !hasSelection })}
        onClick={cutBlocks}
        disabled={!hasSelection}
        title={intl.formatMessage(messages.cutBlocks) + (hasSelection ? '' : ' - Select blocks first')}
        aria-label={intl.formatMessage(messages.cutBlocks)}
        tabIndex={0}
      >
        <Icon name={cutSVG} size="30px" />
      </button>
      
      <button
        className={cx('toolbar-button', { disabled: !hasClipboard })}
        onClick={pasteBlocks}
        disabled={!hasClipboard}
        title={intl.formatMessage(messages.pasteBlocks) + (hasClipboard ? '' : ' - Copy blocks first')}
        aria-label={intl.formatMessage(messages.pasteBlocks)}
        tabIndex={0}
      >
        <Icon name={pasteSVG} size="30px" />
      </button>
      
      {(hasSelection || hasClipboard) && (
        <span className="toolbar-info">
          {hasSelection && (
            selectedBlocks.length > 0 
              ? `${selectedBlocks.length} blocks`
              : '1 block'
          )}
          {hasSelection && hasClipboard && ' • '}
          {hasClipboard && (
            blocksClipboard?.cut?.length > 0
              ? `${blocksClipboard.cut.length} cut`
              : `${blocksClipboard?.copy?.length || 0} copied`
          )}
        </span>
      )}
      
      <div className="toolbar-divider" />
    </div>
  );
};

export default BlockCopyPasteToolbarButtons;