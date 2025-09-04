import React, { useState, useRef, useEffect } from 'react';
import ContentEditable from 'react-contenteditable';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import ButtonSidebar from './ButtonSidebar';
import BlockSidebarPopover from '../../BlockSidebarPopover';
import './Button.scss';

const Edit = (props) => {
  const { data, block, onChangeBlock, selected } = props;
  const [text, setText] = useState(data.text || 'Button');
  const editable = useRef(null);
  const buttonRef = useRef(null);
  const lunaTheming = useSelector((state) => state.lunaTheming);
  
  // Get colors from global theme
  const colors = lunaTheming?.data?.colors || {};
  const getColorValue = (colorKey) => colors[colorKey] || '#666666';

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

  // Generate inline styles based on global theme colors
  const getButtonStyles = () => {
    const colorType = data.color || 'primary';
    const buttonType = data.buttonType || 'filled';
    
    const colorMap = {
      primary: {
        main: getColorValue('primary_color'),
        text: getColorValue('tertiary_color'),
      },
      secondary: {
        main: getColorValue('secondary_color'), 
        text: getColorValue('tertiary_color'),
      },
      tertiary: {
        main: getColorValue('tertiary_color'),
        text: getColorValue('neutral_color'),
      },
      neutral: {
        main: getColorValue('neutral_color'),
        text: getColorValue('tertiary_color'),
      },
      background: {
        main: getColorValue('background_color'),
        text: getColorValue('neutral_color'),
      },
    };

    const selectedColors = colorMap[colorType] || colorMap.primary;

    switch (buttonType) {
      case 'filled':
        return {
          backgroundColor: selectedColors.main,
          color: selectedColors.text,
          borderColor: selectedColors.main,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: selectedColors.main,
          borderColor: selectedColors.main,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: selectedColors.main,
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: selectedColors.main,
          color: selectedColors.text,
          borderColor: selectedColors.main,
        };
    }
  };

  const inlineStyles = getButtonStyles();

  return (
    <>
      <div className={wrapperClasses}>
        <div ref={buttonRef} className={buttonClasses} style={inlineStyles}>
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
      
      <BlockSidebarPopover 
        selected={selected}
        blockNode={buttonRef.current}
        className="button-sidebar-popover"
      >
        <ButtonSidebar
          {...props}
          data={data}
          block={block}
          onChangeBlock={onChangeBlock}
        />
      </BlockSidebarPopover>
    </>
  );
};

export default Edit;