import React from 'react';
import { SidebarPortal } from '@plone/volto/components';
import Sidebar from './Sidebar';
import View from './View';
import { BlockResizeHandles } from '../../../../components/CustomSectionBlock/BlockResizeHandler';
import { getResizeConfig } from '../../../../components/CustomSectionBlock/contentResizeConfig';

const Edit = (props) => {
  const { data, block, onChangeBlock, selected } = props;
  
  // Get the resize configuration for button blocks
  const resizeConfig = getResizeConfig('button');

  return (
    <div style={{ position: 'relative' }}>
      <View {...props} isEditMode />
      
      {/* Content resize handles using the configuration system */}
      {resizeConfig && (
        <BlockResizeHandles
          data={data}
          onChangeBlock={onChangeBlock}
          block={block}
          selected={selected}
          config={resizeConfig}
          colors={{
            fontSize: resizeConfig.fontSize?.color || '#e74c3c',
            padding: resizeConfig.padding?.color || '#f39c12', 
            width: resizeConfig.width?.color || '#9b59b6'
          }}
        />
      )}
      
      <SidebarPortal selected={selected}>
        <Sidebar
          {...props}
          data={data}
          block={block}
          onChangeBlock={onChangeBlock}
        />
      </SidebarPortal>
    </div>
  );
};

export default Edit;