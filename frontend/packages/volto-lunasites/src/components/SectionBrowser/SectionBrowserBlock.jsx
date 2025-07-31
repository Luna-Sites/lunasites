import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

// Component imports
import { Button } from '@plone/components';
import Icon from '@plone/volto/components/theme/Icon/Icon';

// Local component imports
import SectionBrowser from './SectionBrowser';

// Icons
import gridSVG from '@plone/volto/icons/apps.svg';

// Styles
import './SectionStyles.less';

const SectionBrowserBlock = React.memo(
  ({ onChangeBlock, onChangeFormData, properties, block }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = useCallback(() => {
      setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, []);

    return (
      <>
        {/* Replaced <Segment> with a styled <div> for full control */}
        <div className="section-browser-trigger" onClick={handleOpen}>
          <Icon name={gridSVG} size="48px" className="trigger-icon" />
          <h3 className="trigger-title">Browse Pre-designed Sections</h3>
          <p className="trigger-description">
            Click to open the section browser and choose from our collection of
            pre-designed page sections.
          </p>
          <Button variant="primary" onClick={handleOpen}>
            Open Section Browser
          </Button>
        </div>

        {/* The SectionBrowser now uses modern components */}
        <SectionBrowser
          open={isOpen}
          onClose={handleClose}
          blockId={block}
          onChangeFormData={onChangeFormData}
          properties={properties}
        />
      </>
    );
  },
);

SectionBrowserBlock.propTypes = {
  onChangeBlock: PropTypes.func.isRequired,
  onChangeFormData: PropTypes.func.isRequired,
  properties: PropTypes.object.isRequired,
  block: PropTypes.string.isRequired,
};

export default SectionBrowserBlock;
