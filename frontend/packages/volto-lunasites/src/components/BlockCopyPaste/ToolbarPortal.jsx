import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import BlockCopyPasteToolbarButtons from './BlockCopyPasteToolbarButtons';

/**
 * Component that injects copy-paste buttons into the toolbar
 */
const ToolbarPortal = () => {
  const [toolbarContainer, setToolbarContainer] = useState(null);
  const pathname = useSelector((state) => state.router?.location?.pathname);
  
  // Check if we're in edit mode
  const isEditMode = pathname?.endsWith('/edit') || pathname?.includes('/edit');

  useEffect(() => {
    if (!isEditMode) {
      setToolbarContainer(null);
      return;
    }

    // Wait a bit for toolbar to render
    const timer = setTimeout(() => {
      // Find the toolbar-actions element
      const toolbar = document.querySelector('.toolbar-actions');
      if (toolbar) {
        // Check if our container already exists
        let container = toolbar.querySelector('.block-copy-paste-container');
        
        if (!container) {
          // Create container for our buttons
          container = document.createElement('div');
          container.className = 'block-copy-paste-container';
          
          // Find the spacer or add button to insert after
          const spacer = toolbar.querySelector('.toolbar-button-spacer');
          const addButton = toolbar.querySelector('.add');
          
          if (spacer) {
            // Insert after spacer
            spacer.parentNode.insertBefore(container, spacer.nextSibling);
          } else if (addButton) {
            // Insert after add button
            addButton.parentNode.insertBefore(container, addButton.nextSibling);
          } else {
            // Append at the end of toolbar-actions
            toolbar.appendChild(container);
          }
        }
        
        setToolbarContainer(container);
      }
    }, 100);

    // Re-check periodically in case toolbar is re-rendered
    const interval = setInterval(() => {
      const toolbar = document.querySelector('.toolbar-actions');
      if (toolbar && !toolbar.querySelector('.block-copy-paste-container')) {
        // Toolbar was re-rendered, need to re-inject
        clearInterval(interval);
        setToolbarContainer(null);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      // Clean up the container when unmounting
      const container = document.querySelector('.block-copy-paste-container');
      if (container) {
        container.remove();
      }
    };
  }, [isEditMode, pathname]);

  // If no container, don't render
  if (!toolbarContainer) {
    return null;
  }

  // Render the buttons into the toolbar container
  return createPortal(<BlockCopyPasteToolbarButtons />, toolbarContainer);
};

export default ToolbarPortal;