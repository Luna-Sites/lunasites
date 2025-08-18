import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import SectionBrowser from './SectionBrowser';

const SectionBrowserButton = ({ pathname, blockId, afterBlock = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        basic
        icon
        onClick={handleOpen}
        title="Browse Sections"
        className="section-browser-button"
      >
        <Icon name={require('@plone/volto/icons/grid.svg').default} />
      </Button>

      <SectionBrowser
        open={isOpen}
        onClose={handleClose}
        pathname={pathname}
        blockId={blockId}
        afterBlock={afterBlock}
      />
    </>
  );
};

export default SectionBrowserButton;
