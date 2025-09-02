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
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const popoverWidth = 260; // Width of the popover (matches CSS)
    // Get actual popover height if it's rendered, otherwise use max
    const popoverHeight = popoverRef.current 
      ? popoverRef.current.getBoundingClientRect().height 
      : 500; // Max height (matches CSS)
    const margin = 8; // Margin from the button

    // Position at bottom-right corner of the button, under it
    let left = blockRect.right - popoverWidth;
    let top = blockRect.bottom + margin;
    
    // If button is too small or too far left, align popover with left edge of button
    if (left < blockRect.left) {
      left = blockRect.left;
    }
    
    // Check if popover would go off the left edge of viewport
    if (left < margin) {
      left = margin;
    }
    
    // Check if popover would go off the right edge of viewport
    if (left + popoverWidth > viewportWidth - margin) {
      left = viewportWidth - popoverWidth - margin;
    }
    
    // Check if there's enough space below the button
    const spaceBelow = viewportHeight - blockRect.bottom;
    const spaceAbove = blockRect.top;
    
    // Determine if we should position above or below
    if (spaceBelow < popoverHeight + margin && spaceAbove > spaceBelow) {
      // Position above: bottom of popup sticks to top of block
      top = blockRect.top - popoverHeight - margin;
      setPlacement('top');
      
      // If popup would go above viewport, adjust it
      if (top < margin) {
        top = margin;
      }
    } else {
      // Position below (default)
      top = blockRect.bottom + margin;
      setPlacement('bottom');
    }

    // Add scroll offset AFTER all calculations
    top += scrollY;
    left += scrollX;

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
      
      // Also observe the block node for position/size changes
      const blockObserver = new ResizeObserver(() => {
        calculatePosition();
      });
      
      blockObserver.observe(blockNode);
      
      // Use MutationObserver to detect attribute changes (like class changes that affect position)
      const mutationObserver = new MutationObserver(() => {
        calculatePosition();
      });
      
      mutationObserver.observe(blockNode, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        subtree: true
      });

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        blockObserver.disconnect();
        mutationObserver.disconnect();
      };
    } else {
      setIsVisible(false);
    }
  }, [selected, blockNode, calculatePosition]);
  
  // Recalculate position when content changes (e.g., tab switch)
  useEffect(() => {
    if (isVisible && popoverRef.current) {
      // Create a ResizeObserver to watch for size changes
      const resizeObserver = new ResizeObserver(() => {
        calculatePosition();
      });
      
      resizeObserver.observe(popoverRef.current);
      
      // Also recalculate after a small delay for initial render
      const timer = setTimeout(() => {
        calculatePosition();
      }, 50);
      
      return () => {
        resizeObserver.disconnect();
        clearTimeout(timer);
      };
    }
  }, [isVisible, calculatePosition]);

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
        maxHeight: '500px',
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