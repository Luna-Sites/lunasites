/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useState, useEffect } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import SimpleColorPicker from '../Widgets/SimpleColorPicker';
import './ColorsSelector.scss';

// Text Color Functions
const injectTextColorCSS = (colorValue) => {
  const styleId = 'volto-lunasites-text-colors';
  let styleElement = document.getElementById(styleId);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = `
    .text-color-custom {
      color: ${colorValue} !important;
    }
    
    .text-color-custom::selection {
      background-color: #a8c4f7 !important;
      color: ${colorValue} !important;
    }
    
    .text-color-custom::-moz-selection {
      background-color: #a8c4f7 !important;
      color: ${colorValue} !important;
    }
    
    [data-slate-editor] .text-color-custom {
      color: ${colorValue} !important;
    }
    
    [data-slate-editor] .text-color-custom::selection {
      background-color: #a8c4f7 !important;
      color: ${colorValue} !important;
    }
  `;
};

const toggleInlineTextColorFormat = (editor, colorValue) => {
  if (!editor.selection) return false;

  const marks = Editor.marks(editor) || {};
  Object.keys(marks).forEach((mark) => {
    if (mark.startsWith('style-text-color-')) {
      Editor.removeMark(editor, mark);
    }
  });

  if (colorValue && colorValue.trim()) {
    injectTextColorCSS(colorValue);
    const textColorMark = `style-text-color-custom`;
    Editor.addMark(editor, textColorMark, true);
  }

  return true;
};

const getCurrentTextColor = (editor) => {
  const marks = Editor.marks(editor);
  if (!marks) return '';

  if (marks['style-text-color-custom']) {
    const styleElement = document.getElementById('volto-lunasites-text-colors');
    if (styleElement) {
      const match = styleElement.textContent.match(/color:\s*([^;!]+)/);
      if (match) {
        return match[1].trim();
      }
    }
  }

  return '';
};

// Background Color Functions
const injectBackgroundColorCSS = (colorValue) => {
  const styleId = 'volto-lunasites-text-background-colors';
  let styleElement = document.getElementById(styleId);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = `
    .text-background-color-custom {
      background-color: ${colorValue} !important;
    }
    
    .text-background-color-custom::selection {
      background-color: ${colorValue} !important;
      color: inherit !important;
    }
    
    .text-background-color-custom::-moz-selection {
      background-color: ${colorValue} !important;
      color: inherit !important;
    }
    
    [data-slate-editor] .text-background-color-custom {
      background-color: ${colorValue} !important;
    }
    
    [data-slate-editor] .text-background-color-custom::selection {
      background-color: ${colorValue} !important;
      color: inherit !important;
    }
  `;
};

const toggleInlineTextBackgroundColorFormat = (editor, colorValue) => {
  if (!editor.selection) return false;

  const marks = Editor.marks(editor) || {};
  Object.keys(marks).forEach((mark) => {
    if (mark.startsWith('style-text-background-color-')) {
      Editor.removeMark(editor, mark);
    }
  });

  if (colorValue && colorValue.trim()) {
    injectBackgroundColorCSS(colorValue);
    const backgroundColorMark = `style-text-background-color-custom`;
    Editor.addMark(editor, backgroundColorMark, true);
  }

  return true;
};

const getCurrentTextBackgroundColor = (editor) => {
  const marks = Editor.marks(editor);
  if (!marks) return '';

  if (marks['style-text-background-color-custom']) {
    const styleElement = document.getElementById(
      'volto-lunasites-text-background-colors',
    );
    if (styleElement) {
      const match = styleElement.textContent.match(
        /background-color:\s*([^;!]+)/,
      );
      if (match) {
        return match[1].trim();
      }
    }
  }

  return '';
};

const ColorsSelector = ({ ...props }) => {
  const editor = useSlate();
  const currentTextColor = getCurrentTextColor(editor);
  const currentTextBackgroundColor = getCurrentTextBackgroundColor(editor);
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [savedSelection, setSavedSelection] = useState(null);

  const handleTextColorChange = useCallback(
    (id, colorValue) => {
      // Restore the saved selection before applying color
      if (savedSelection) {
        editor.selection = savedSelection;
      }
      toggleInlineTextColorFormat(editor, colorValue);
    },
    [editor, savedSelection],
  );

  const handleBackgroundColorChange = useCallback(
    (id, colorValue) => {
      // Restore the saved selection before applying color
      if (savedSelection) {
        editor.selection = savedSelection;
      }
      toggleInlineTextBackgroundColorFormat(editor, colorValue);
    },
    [editor, savedSelection],
  );

  const handleButtonClick = useCallback(
    (event) => {
      event.preventDefault();

      if (!showColorPopup) {
        // Save the current selection before opening the popup
        setSavedSelection(editor.selection);
      }

      setShowColorPopup(!showColorPopup);
    },
    [showColorPopup, editor],
  );

  const handleMouseDown = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the colors selector wrapper or any color picker
      if (
        !event.target.closest('.colors-selector-wrapper') &&
        !event.target.closest('.simple-color-picker') &&
        !event.target.closest('.chrome-picker') &&
        !event.target.closest('.sketch-picker') &&
        !event.target.closest('.color-picker')
      ) {
        setShowColorPopup(false);
      }
    };

    if (showColorPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPopup]);

  const displayTextColor = currentTextColor || '#000000';
  const displayBackgroundColor = currentTextBackgroundColor || '#ffffff';

  return (
    <div
      className="colors-selector-wrapper"
      {...props}
      onMouseDown={handleMouseDown}
    >
      <button
        className="ui tiny compact icon button colors-button"
        onClick={handleButtonClick}
        title="Text Colors"
        type="button"
      >
        <div className="colors-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="icon"
            style={{ height: '18px', width: '18px', fill: 'currentcolor' }}
          >
            <path d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9S16.97,3,12,3z M12,8.5c1.38,0,2.5,1.12,2.5,2.5 c0,1.38-1.12,2.5-2.5,2.5S9.5,12.38,9.5,11C9.5,9.62,10.62,8.5,12,8.5z" />
          </svg>
          <div className="color-indicators">
            <div
              className="text-color-indicator"
              style={{ backgroundColor: displayTextColor }}
            />
            <div
              className="background-color-indicator"
              style={{ backgroundColor: displayBackgroundColor }}
            />
          </div>
        </div>
      </button>

      {showColorPopup && (
        <div className="colors-popup">
          <div className="color-section">
            <h4>Text Color</h4>
            <SimpleColorPicker
              id="text-color"
              value={currentTextColor}
              onChange={handleTextColorChange}
              style={{
                width: '200px',
                height: '150px',
              }}
            />
          </div>

          <div className="color-section">
            <h4>Background Color</h4>
            <SimpleColorPicker
              id="background-color"
              value={currentTextBackgroundColor}
              onChange={handleBackgroundColorChange}
              style={{
                width: '200px',
                height: '150px',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorsSelector;
