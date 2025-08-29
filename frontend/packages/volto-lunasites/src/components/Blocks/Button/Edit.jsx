import React, { useState, useRef, useEffect } from 'react';
import ContentEditable from 'react-contenteditable';
import { SidebarPortal } from '@plone/volto/components';
import cx from 'classnames';
import ButtonSidebar from './ButtonSidebar';
import './Button.scss';

const Edit = (props) => {
  const { data, block, onChangeBlock, selected } = props;
  const [text, setText] = useState(data.text || 'Button');
  const editable = useRef(null);

  useEffect(() => {
    if (selected && editable.current) {
      editable.current.focus();
    }
  }, [selected]);

  const handleTextChange = (evt) => {
    const newText = evt.target.value.replace(/<[^>]+>/g, ''); // Strip HTML tags
    setText(newText);
    onChangeBlock(block, { ...data, text: newText });
  };

  // Determine button classes based on configuration
  const buttonClasses = cx('luna-button', {
    [`luna-button--${data.buttonType || 'filled'}`]: true,
    [`luna-button--${data.size || 'm'}`]: true,
    [`luna-button--${data.color || 'primary'}`]: data.color,
    'luna-button--full': data.width === 'full',
    'luna-button--fit': data.width === 'fit',
  });

  // Determine alignment classes
  const wrapperClasses = cx('luna-button-wrapper', {
    [`align-${data.align || 'left'}`]: true,
  });

  return (
    <>
      <div className={wrapperClasses}>
        <div className={buttonClasses}>
          <ContentEditable
            innerRef={editable}
            html={text}
            onChange={handleTextChange}
            className="luna-button__text"
            tagName="span"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          />
        </div>
      </div>
      
      <SidebarPortal selected={selected}>
        <ButtonSidebar
          {...props}
          data={data}
          block={block}
          onChangeBlock={onChangeBlock}
        />
      </SidebarPortal>
    </>
  );
};

export default Edit;