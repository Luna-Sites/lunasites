/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import SimpleColorPicker from 'lunasites-advanced-styling/Widgets/SimpleColorPicker';
import './TextColorSelector.scss';

const injectColorCSS = (colorValue) => {
  const styleId = 'volto-lunasites-text-colors';
  let styleElement = document.getElementById(styleId);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  // Inject CSS for the specific color
  styleElement.textContent = `
    .text-color-custom {
      color: ${colorValue} !important;
    }
  `;
};

const toggleInlineTextColorFormat = (editor, colorValue) => {
  // Remove any existing text color marks
  const marks = Editor.marks(editor) || {};
  Object.keys(marks).forEach((mark) => {
    if (mark.startsWith('style-text-color-')) {
      Editor.removeMark(editor, mark);
    }
  });

  // Apply the new text color mark if it's not empty
  if (colorValue && colorValue.trim()) {
    // Inject CSS for this color
    injectColorCSS(colorValue);

    // Apply the mark - volto-slate will convert style-text-color-custom to CSS class text-color-custom
    const colorMark = `style-text-color-custom`;
    Editor.addMark(editor, colorMark, true);
  }
};

const getCurrentTextColor = (editor) => {
  const marks = Editor.marks(editor);
  if (!marks) return '';

  // Check if text color mark is active
  if (marks['style-text-color-custom']) {
    // Try to get the color from the current CSS
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

const TextColorSelector = ({ ...props }) => {
  const editor = useSlate();
  const currentTextColor = getCurrentTextColor(editor);

  const handleTextColorChange = useCallback(
    (id, colorValue) => {
      toggleInlineTextColorFormat(editor, colorValue);
    },
    [editor],
  );

  const handleMouseDown = useCallback((event) => {
    // Prevent mousedown from taking focus away from the editor
    event.preventDefault();
  }, []);

  return (
    <div
      className="text-color-selector-wrapper"
      {...props}
      onMouseDown={handleMouseDown}
    >
      <div className="text-color-picker-container">
        <SimpleColorPicker
          id="text-color"
          value={currentTextColor}
          onChange={handleTextColorChange}
          style={{
            width: '32px',
            height: '32px',
          }}
        />
      </div>
    </div>
  );
};

export default TextColorSelector;
