import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  setBlocksClipboard,
  resetBlocksClipboard,
} from '@plone/volto/actions/blocksClipboard/blocksClipboard';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { cloneBlocks } from '@plone/volto/helpers/Blocks/cloneBlocks';
import { v4 as uuid } from 'uuid';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import copySVG from '@plone/volto/icons/copy.svg';
import cutSVG from '@plone/volto/icons/cut.svg';
import pasteSVG from '@plone/volto/icons/paste.svg';

import './FloatingBlockToolbar.css';

const FloatingBlockToolbar = ({
  properties,
  onChangeFormData,
  onSelectBlock,
}) => {
  const dispatch = useDispatch();
  const selectedBlocks = useSelector(
    (state) => state?.form?.ui?.multiSelected || [],
  );
  const selectedBlock = useSelector((state) => state?.form?.ui?.selected);
  const blocksClipboard = useSelector((state) => state.blocksClipboard || {});

  // Dragging state
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef(null);

  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  // Determine if we have any blocks selected
  const hasSelection = selectedBlocks.length > 0 || selectedBlock;
  const hasClipboard =
    blocksClipboard?.copy?.length > 0 || blocksClipboard?.cut?.length > 0;
  
  console.log('🎯 FloatingBlockToolbar - hasSelection:', hasSelection, 'selectedBlock:', selectedBlock, 'selectedBlocks:', selectedBlocks);
  console.log('📋 FloatingBlockToolbar - hasClipboard:', hasClipboard, 'clipboard:', blocksClipboard);

  const copyBlocks = () => {
    const blocks = properties?.[blocksFieldname] || {};
    const blocksToCopy =
      selectedBlocks.length > 0
        ? selectedBlocks
        : selectedBlock
        ? [selectedBlock]
        : [];

    if (blocksToCopy.length === 0) {
      toast.warning('No blocks selected');
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
        `Copied ${copiedBlocks.length} block${
          copiedBlocks.length > 1 ? 's' : ''
        } to clipboard`,
      );
    }
  };

  const cutBlocks = () => {
    const blocks = properties?.[blocksFieldname] || {};
    const blocks_layout = properties?.[blocksLayoutFieldname] || {};

    const blocksToCut =
      selectedBlocks.length > 0
        ? selectedBlocks
        : selectedBlock
        ? [selectedBlock]
        : [];

    if (blocksToCut.length === 0) {
      toast.warning('No blocks selected');
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

      onChangeFormData({
        [blocksFieldname]: newBlocks,
        [blocksLayoutFieldname]: newBlocksLayout,
      });

      toast.success(
        `Cut ${cutBlocksData.length} block${
          cutBlocksData.length > 1 ? 's' : ''
        } to clipboard`,
      );
    }
  };

  const pasteBlocks = () => {
    const blocks = properties?.[blocksFieldname] || {};
    const blocks_layout = properties?.[blocksLayoutFieldname] || {};

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
      toast.info('Clipboard is empty');
      return;
    }

    const targetBlock =
      selectedBlock || blocks_layout.items?.[blocks_layout.items.length - 1];
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

    onChangeFormData({
      [blocksFieldname]: newBlocks,
      [blocksLayoutFieldname]: newBlocksLayout,
    });

    if (newIds.length > 0) {
      onSelectBlock(newIds[0]);
    }

    toast.success(
      `Pasted ${newIds.length} block${newIds.length > 1 ? 's' : ''}`,
    );
  };

  // Dragging handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !toolbarRef.current) return;
      
      const toolbar = toolbarRef.current;
      const rect = toolbar.getBoundingClientRect();
      
      // Calculate new position
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      
      // Constrain to viewport bounds
      const maxX = window.innerWidth - rect.width - 20; // 20px margin
      const maxY = window.innerHeight - rect.height - 20;
      const minX = 20;
      const minY = 20;
      
      newX = Math.min(Math.max(newX, minX), maxX);
      newY = Math.min(Math.max(newY, minY), maxY);
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e) => {
    if (!toolbarRef.current) return;
    
    const rect = toolbarRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    e.preventDefault(); // Prevent text selection while dragging
  };

  // Always render in edit mode to show users the feature exists
  // Previously: if (!hasSelection && !hasClipboard) return null;

  // Check if document is available (client-side only)
  if (typeof document === 'undefined') {
    return null;
  }

  // Calculate style with position
  const toolbarStyle = position.x !== null && position.y !== null
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
      }
    : {};

  const toolbarContent = (
    <div 
      className="floating-block-toolbar" 
      ref={toolbarRef}
      style={toolbarStyle}
    >
      <div className="toolbar-title" onMouseDown={handleMouseDown}>
        Block Actions
      </div>
      <div className="toolbar-buttons">
        <button
          className="toolbar-button"
          onClick={copyBlocks}
          disabled={!hasSelection}
          title="Copy blocks (Ctrl/Cmd+C)"
        >
          <Icon name={copySVG} size="20px" />
          <span>Copy</span>
        </button>

        <button
          className="toolbar-button"
          onClick={cutBlocks}
          disabled={!hasSelection}
          title="Cut blocks (Ctrl/Cmd+X)"
        >
          <Icon name={cutSVG} size="20px" />
          <span>Cut</span>
        </button>

        <button
          className="toolbar-button"
          onClick={pasteBlocks}
          disabled={!hasClipboard}
          title="Paste blocks (Ctrl/Cmd+V)"
        >
          <Icon name={pasteSVG} size="20px" />
          <span>Paste</span>
        </button>
      </div>

      <div className="toolbar-info">
        {hasSelection ? (
          <span className="selection-info">
            {selectedBlocks.length > 0
              ? `${selectedBlocks.length} blocks selected`
              : '1 block selected'}
          </span>
        ) : (
          <span className="selection-info">
            Click on a block to select it
            <br />
            <small>Ctrl+Click for multi-select</small>
          </span>
        )}
        {hasClipboard && (
          <span className="clipboard-info">
            {blocksClipboard?.cut?.length > 0
              ? `${blocksClipboard.cut.length} blocks in clipboard (cut)`
              : blocksClipboard?.copy?.length > 0
              ? `${blocksClipboard.copy.length} blocks in clipboard`
              : ''}
          </span>
        )}
      </div>
    </div>
  );
  
  // Use React Portal to render at the body level
  return createPortal(toolbarContent, document.body);
};

export default FloatingBlockToolbar;
