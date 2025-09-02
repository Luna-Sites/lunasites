import React, { useState } from 'react';
import { Icon } from '@plone/volto/components';
import { BlockDataForm } from '@plone/volto/components';
import settingsSVG from '@plone/volto/icons/settings.svg';
import paintSVG from '@plone/volto/icons/paint.svg';
import copySVG from '@plone/volto/icons/copy.svg';
import deleteSVG from '@plone/volto/icons/delete.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import './TabbedSidebar.scss';

const TabbedSidebar = ({ 
  settingsSchema,
  stylesSchema,
  data,
  block,
  onChangeBlock,
  onDuplicate,
  onDelete,
  onClose,
  navRoot,
  contentType,
  title 
}) => {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="tabbed-sidebar">
      <div className="tabbed-sidebar__header">
        <div className="tabbed-sidebar__header-top">
          <h3 className="tabbed-sidebar__title">{title}</h3>
          <div className="tabbed-sidebar__actions">
            {onDuplicate && (
              <button
                className="tabbed-sidebar__action"
                onClick={onDuplicate}
                title="Copy block"
              >
                <Icon name={copySVG} size="16px" />
              </button>
            )}
            {onDelete && (
              <button
                className="tabbed-sidebar__action"
                onClick={onDelete}
                title="Delete block"
              >
                <Icon name={deleteSVG} size="16px" />
              </button>
            )}
            {onClose && (
              <button
                className="tabbed-sidebar__action"
                onClick={onClose}
                title="Close"
              >
                <Icon name={clearSVG} size="16px" />
              </button>
            )}
          </div>
        </div>
        <div className="tabbed-sidebar__tabs">
          <button
            className={`tabbed-sidebar__tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Icon name={settingsSVG} size="18px" />
            <span>Settings</span>
          </button>
          <button
            className={`tabbed-sidebar__tab ${activeTab === 'styles' ? 'active' : ''}`}
            onClick={() => setActiveTab('styles')}
            title="Styles"
          >
            <Icon name={paintSVG} size="18px" />
            <span>Styles</span>
          </button>
        </div>
      </div>
      
      <div className="tabbed-sidebar__content">
        {activeTab === 'settings' && settingsSchema && (
          <div className="tabbed-sidebar__panel">
            <BlockDataForm
              schema={settingsSchema}
              onChangeField={(id, value) => {
                onChangeBlock(block, {
                  ...data,
                  [id]: value,
                });
              }}
              onChangeBlock={onChangeBlock}
              formData={data}
              block={block}
              navRoot={navRoot}
              contentType={contentType}
            />
          </div>
        )}
        
        {activeTab === 'styles' && stylesSchema && (
          <div className="tabbed-sidebar__panel">
            <BlockDataForm
              schema={stylesSchema}
              onChangeField={(id, value) => {
                onChangeBlock(block, {
                  ...data,
                  [id]: value,
                });
              }}
              onChangeBlock={onChangeBlock}
              formData={data}
              block={block}
              navRoot={navRoot}
              contentType={contentType}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedSidebar;