import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  setBlocksClipboard,
  resetBlocksClipboard,
} from '@plone/volto/actions/blocksClipboard/blocksClipboard';
import {
  getBlocks,
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { cloneBlocks } from '@plone/volto/helpers/Blocks/cloneBlocks';
import { v4 as uuid } from 'uuid';

/**
 * Custom hook for handling block copy/paste keyboard shortcuts
 * @param {Object} properties - The form properties
 * @param {Function} onChangeFormData - Function to update form data
 * @param {Function} onSelectBlock - Function to select a block
 * @param {Object} metadata - Metadata for the current content
 */
const useBlockCopyPaste = ({
  properties,
  onChangeFormData,
  onSelectBlock,
  metadata,
}) => {
  const dispatch = useDispatch();
  const selectedBlocks = useSelector(
    (state) => state?.form?.ui?.multiSelected || [],
  );
  const selectedBlock = useSelector((state) => state?.form?.ui?.selected);
  const blocksClipboard = useSelector((state) => state.blocksClipboard || {});

  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const copyBlocksToClipboard = useCallback(() => {
    const blocks = properties?.[blocksFieldname] || {};
    const blocks_layout = properties?.[blocksLayoutFieldname] || {};

    // Determine which blocks to copy
    const blocksToCopy =
      selectedBlocks.length > 0
        ? selectedBlocks
        : selectedBlock
        ? [selectedBlock]
        : [];

    if (blocksToCopy.length === 0) {
      return;
    }

    // Get block data for selected blocks
    const copiedBlocks = blocksToCopy
      .filter((blockId) => blocks[blockId])
      .map((blockId) => [blockId, blocks[blockId]]);

    if (copiedBlocks.length > 0) {
      // Store in clipboard with copy mode - match Volto's structure
      dispatch(setBlocksClipboard({ copy: copiedBlocks }));

      // Sync to localStorage for cross-tab support
      window.localStorage.setItem(
        'volto:blocksClipboard',
        JSON.stringify({ copy: copiedBlocks }),
      );

      toast.success(
        `Copied ${copiedBlocks.length} block${
          copiedBlocks.length > 1 ? 's' : ''
        } to clipboard`,
      );
    }
  }, [
    dispatch,
    properties,
    selectedBlocks,
    selectedBlock,
    blocksFieldname,
    blocksLayoutFieldname,
  ]);

  const cutBlocksToClipboard = useCallback(() => {
    const blocks = properties?.[blocksFieldname] || {};
    const blocks_layout = properties?.[blocksLayoutFieldname] || {};

    // Determine which blocks to cut
    const blocksToCut =
      selectedBlocks.length > 0
        ? selectedBlocks
        : selectedBlock
        ? [selectedBlock]
        : [];

    if (blocksToCut.length === 0) {
      return;
    }

    // Get block data for selected blocks
    const cutBlocks = blocksToCut
      .filter((blockId) => blocks[blockId])
      .map((blockId) => [blockId, blocks[blockId]]);

    if (cutBlocks.length > 0) {
      // Store in clipboard with cut mode - match Volto's structure
      dispatch(setBlocksClipboard({ cut: cutBlocks }));

      // Sync to localStorage for cross-tab support
      window.localStorage.setItem(
        'volto:blocksClipboard',
        JSON.stringify({ cut: cutBlocks }),
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

      onChangeFormData({
        [blocksFieldname]: newBlocks,
        [blocksLayoutFieldname]: newBlocksLayout,
      });

      toast.success(
        `Cut ${cutBlocks.length} block${
          cutBlocks.length > 1 ? 's' : ''
        } to clipboard`,
      );
    }
  }, [
    dispatch,
    properties,
    selectedBlocks,
    selectedBlock,
    blocksFieldname,
    blocksLayoutFieldname,
    onChangeFormData,
  ]);

  const pasteBlocks = useCallback(() => {
    const blocks = properties?.[blocksFieldname] || {};
    const blocks_layout = properties?.[blocksLayoutFieldname] || {};

    // Get clipboard data (from Redux or localStorage)
    let clipboardData = blocksClipboard;

    if (!clipboardData?.copy?.length && !clipboardData?.cut?.length) {
      // Try to get from localStorage
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
      toast.info('Clipboard is empty');
      return;
    }

    // Determine where to paste (after selected block or at the end)
    const targetBlock =
      selectedBlock || blocks_layout.items?.[blocks_layout.items.length - 1];
    const targetIndex = targetBlock
      ? blocks_layout.items?.indexOf(targetBlock)
      : blocks_layout.items?.length - 1;

    const newBlocks = { ...blocks };
    const newBlocksLayout = { ...blocks_layout };
    const newIds = [];

    if (mode === 'copy') {
      // Copy mode: clone blocks with new IDs
      const clonedBlocks = cloneBlocks(blocksData);

      clonedBlocks.forEach(([originalId, blockData], index) => {
        const newId = uuid();
        newIds.push(newId);
        newBlocks[newId] = blockData;

        // Insert in layout after target position
        const insertIndex = targetIndex + 1 + index;
        newBlocksLayout.items.splice(insertIndex, 0, newId);
      });
    } else if (mode === 'cut') {
      // Cut mode: use original IDs
      blocksData.forEach(([blockId, blockData], index) => {
        newIds.push(blockId);
        newBlocks[blockId] = blockData;

        // Insert in layout after target position
        const insertIndex = targetIndex + 1 + index;
        newBlocksLayout.items.splice(insertIndex, 0, blockId);
      });

      // Clear clipboard after paste for cut operation
      dispatch(resetBlocksClipboard());
      window.localStorage.removeItem('volto:blocksClipboard');
    }

    // Update form data
    onChangeFormData({
      [blocksFieldname]: newBlocks,
      [blocksLayoutFieldname]: newBlocksLayout,
    });

    // Select the first pasted block
    if (newIds.length > 0) {
      onSelectBlock(newIds[0]);
    }

    toast.success(
      `Pasted ${newIds.length} block${newIds.length > 1 ? 's' : ''}`,
    );
  }, [
    properties,
    blocksClipboard,
    selectedBlock,
    blocksFieldname,
    blocksLayoutFieldname,
    onChangeFormData,
    onSelectBlock,
    dispatch,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if we're in a text input, textarea, or Slate editor
      const activeElement = document.activeElement;
      const isTextInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.contentEditable === 'true' ||
          activeElement.closest('[contenteditable="true"]') ||
          activeElement.closest('.slate-editor') ||
          activeElement.closest('[data-slate-editor="true"]') ||
          activeElement.closest('[data-slate-node]') ||
          activeElement.closest('.block-editor-slate'));

      // Don't intercept if user is editing text
      if (isTextInput) {
        return;
      }

      // Also check if we're in a slate block by looking for slate-specific classes
      const isInSlateBlock = document.querySelector('.slate-editor:focus-within') || 
                             document.querySelector('[data-slate-editor="true"]:focus-within');
      
      if (isInSlateBlock) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlCmd = isMac ? event.metaKey : event.ctrlKey;

      // Copy: Ctrl/Cmd + C
      if (isCtrlCmd && event.key === 'c' && !event.shiftKey && !event.altKey) {
        // Check if blocks are selected
        if (selectedBlock || selectedBlocks.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          copyBlocksToClipboard();
        }
      }

      // Cut: Ctrl/Cmd + X
      if (isCtrlCmd && event.key === 'x' && !event.shiftKey && !event.altKey) {
        // Check if blocks are selected
        if (selectedBlock || selectedBlocks.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          cutBlocksToClipboard();
        }
      }

      // Paste: Ctrl/Cmd + V
      if (isCtrlCmd && event.key === 'v' && !event.shiftKey && !event.altKey) {
        // Check if we have something to paste
        const stored = window.localStorage.getItem('volto:blocksClipboard');
        if (blocksClipboard?.copy?.length || blocksClipboard?.cut?.length || stored) {
          event.preventDefault();
          event.stopPropagation();
          pasteBlocks();
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedBlock,
    selectedBlocks,
    blocksClipboard,
    copyBlocksToClipboard,
    cutBlocksToClipboard,
    pasteBlocks,
  ]);
};

export default useBlockCopyPaste;
