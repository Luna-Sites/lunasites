import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './BlockSidebarPopover.scss';

/**
 * BlockSidebarPopover - Renders block settings as a popover next to the block
 * instead of in the traditional right sidebar
 */
const BlockSidebarPopover = ({ children, selected, blockNode, className = '' }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef(null);
  const [placement, setPlacement] = useState('right'); // 'right' or 'left'

  const calculatePosition = useCallback(() => {
    if (!blockNode || !selected) return;

    const blockRect = blockNode.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popoverWidth = 340; // Approximate width of the popover
    const popoverHeight = 400; // Approximate height
    const margin = 20; // Margin from the block

    // Determine if popover should appear on the right or left
    const spaceOnRight = viewportWidth - blockRect.right;
    const spaceOnLeft = blockRect.left;
    
    let left, top;
    
    if (spaceOnRight >= popoverWidth + margin) {
      // Place on the right
      left = blockRect.right + margin;
      setPlacement('right');
    } else if (spaceOnLeft >= popoverWidth + margin) {
      // Place on the left
      left = blockRect.left - popoverWidth - margin;
      setPlacement('left');
    } else {
      // Default to right even if it might overflow
      left = blockRect.right + margin;
      setPlacement('right');
    }

    // Calculate vertical position - try to center with the block
    top = blockRect.top + (blockRect.height / 2) - (popoverHeight / 2);
    
    // Ensure popover doesn't go off the top of the screen
    if (top < margin) {
      top = margin;
    }
    
    // Ensure popover doesn't go off the bottom of the screen
    if (top + popoverHeight > viewportHeight - margin) {
      top = viewportHeight - popoverHeight - margin;
    }

    // Add scroll offset
    top += window.scrollY;
    left += window.scrollX;

    setPosition({ top, left });
    setIsVisible(true);
  }, [blockNode, selected]);

  useEffect(() => {
    if (selected && blockNode) {
      calculatePosition();
      
      // Recalculate position on scroll or resize
      const handleScrollOrResize = () => {
        calculatePosition();
      };

      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    } else {
      setIsVisible(false);
    }
  }, [selected, blockNode, calculatePosition]);

  // Click outside to close
  useEffect(() => {
    if (!selected || !isVisible) return;

    const handleClickOutside = (event) => {
      // Check if click is outside both the block and the popover
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        blockNode &&
        !blockNode.contains(event.target)
      ) {
        // This would typically trigger deselecting the block
        // But we'll let Volto handle that through its normal mechanisms
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selected, isVisible, blockNode]);

  if (!selected || !isVisible) return null;

  // Create portal to render at document body level
  return ReactDOM.createPortal(
    <div
      ref={popoverRef}
      className={`block-sidebar-popover ${className} ${placement}`}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="block-sidebar-popover__container">
        <div className="block-sidebar-popover__arrow" />
        <div className="block-sidebar-popover__content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BlockSidebarPopover;