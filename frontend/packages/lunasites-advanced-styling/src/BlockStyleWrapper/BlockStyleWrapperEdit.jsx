import React from 'react';
import { StyleWrapperEdit, StyleWrapperView } from '../StyleWrapper';
import { createPortal } from 'react-dom';
import themeSVG from '@plone/volto/icons/theme.svg';
import { Icon } from '@plone/volto/components';
import config from '@plone/volto/registry';

// For blocks, store the style data in data.styles, then
// adapt the data.styles.[align,size,...] info to default data.align, data.size, etc.

const BlockStyleWrapperEdit = (props) => {
  const { selected, block, data = {}, onChangeBlock, manage } = props;
  const [isVisible, setIsVisible] = React.useState(false);
  const visible =
    selected && (config.settings.layoutOnlyBlockStyles ? manage : true);

  // Stochează nodul tabsNode într-un ref pentru performanță și evitare rerender
  const tabsNode = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return document.querySelector(
        '#sidebar > .sidebar-container > .tabs-wrapper > .formtabs',
      );
    }
    return null;
  }, []);

  // triggerButton nu mai folosește <Portal>, ci createPortal direct
  const triggerButton = tabsNode
    ? createPortal(
        <div className="open-styles-button">
          <button
            onClick={(e) => {
              e.nativeEvent.stopImmediatePropagation();
              setIsVisible(true);
            }}
            title={`${
              props.type ? 'Style palette for ' + props.type : 'Style pallete'
            }`}
          >
            <Icon name={themeSVG} size="18px" />
          </button>
        </div>,
        tabsNode,
      )
    : null;

  return (
    <>
      {visible ? triggerButton : null}
      <StyleWrapperEdit
        {...props}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        data={{
          ...data?.styles,
          ...(data.align ? { align: data.align } : {}),
          ...(data.size ? { size: data.size } : {}),
        }}
        blockData={data}
        choices={[]}
        onChangeValue={(id, value) =>
          onChangeBlock(block, {
            ...data,
            ...(id === 'align' ? { align: value } : {}),
            ...(id === 'size' ? { size: value } : {}),
            ...(id === 'customId' ? { id: value } : {}),
            styles: {
              ...data?.styles,
              [id]: value,
            },
          })
        }
      ></StyleWrapperEdit>
      <StyleWrapperView mode="edit" {...props} styleData={data.styles || {}} />
    </>
  );
};

export default BlockStyleWrapperEdit;
