import React, { useState } from 'react';
import { Icon } from '@plone/volto/components';
import { BlockDataForm } from '@plone/volto/components';
import settingsSVG from '@plone/volto/icons/settings.svg';
import paintSVG from '@plone/volto/icons/paint.svg';
import './TabbedSidebar.scss';

const TabbedSidebar = ({ 
  settingsSchema,
  stylesSchema,
  data,
  block,
  onChangeBlock,
  navRoot,
  contentType,
  title 
}) => {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="tabbed-sidebar">
      <div className="tabbed-sidebar__header">
        <h3 className="tabbed-sidebar__title">{title}</h3>
        <div className="tabbed-sidebar__tabs">
          <button
            className={`tabbed-sidebar__tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Icon name={settingsSVG} size="18px" />
          </button>
          <button
            className={`tabbed-sidebar__tab ${activeTab === 'styles' ? 'active' : ''}`}
            onClick={() => setActiveTab('styles')}
            title="Styles"
          >
            <Icon name={paintSVG} size="18px" />
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