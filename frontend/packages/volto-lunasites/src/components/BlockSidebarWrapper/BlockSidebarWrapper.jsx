import React from 'react';
import './BlockSidebarWrapper.scss';

/**
 * Generic wrapper for block sidebars with consistent styling
 * Provides rounded corners and drop shadow for all block edit menus
 */
const BlockSidebarWrapper = ({ children, className = '' }) => {
  return (
    <div className={`block-sidebar-wrapper ${className}`}>
      <div className="block-sidebar-wrapper__container">
        {children}
      </div>
    </div>
  );
};

export default BlockSidebarWrapper;