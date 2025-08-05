/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import SimpleColorPicker from 'lunasites-advanced-styling/Widgets/SimpleColorPicker';
import './TextBackgroundColorSelector.scss';

const injectBackgroundColorCSS = (colorValue) => {
  const styleId = 'volto-lunasites-text-background-colors';
  let styleElement = document.getElementById(styleId);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  // Inject CSS for the specific background color with selection support
  styleElement.textContent = `
    .text-background-color-custom {
      background-color: ${colorValue} !important;
    }
    
    /* Ensure background color shows even when text is selected */
    .text-background-color-custom::selection {
      background-color: ${colorValue} !important;
      color: inherit !important;
    }
    
    .text-background-color-custom::-moz-selection {
      background-color: ${colorValue} !important;
      color: inherit !important;
    }
    
    /* For Slate editor specific selection states */
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
  // Remove any existing text background color marks
  const marks = Editor.marks(editor) || {};
  Object.keys(marks).forEach((mark) => {
    if (mark.startsWith('style-text-background-color-')) {
      Editor.removeMark(editor, mark);
    }
  });

  // Apply the new text background color mark if it's not empty
  if (colorValue && colorValue.trim()) {
    // Inject CSS for this background color
    injectBackgroundColorCSS(colorValue);

    // Apply the mark - volto-slate will convert style-text-background-color-custom to CSS class text-background-color-custom
    const backgroundColorMark = `style-text-background-color-custom`;
    Editor.addMark(editor, backgroundColorMark, true);
    
    // Deselect the text after applying background color so the color becomes visible immediately
    setTimeout(() => {
      if (editor.selection) {
        // Move cursor to the end of the selection to deselect
        const { anchor, focus } = editor.selection;
        const end = anchor.offset > focus.offset ? anchor : focus;
        editor.selection = {
          anchor: end,
          focus: end,
        };
      }
    }, 10);
  }
};

const getCurrentTextBackgroundColor = (editor) => {
  const marks = Editor.marks(editor);
  if (!marks) return '';

  // Check if text background color mark is active
  if (marks['style-text-background-color-custom']) {
    // Try to get the background color from the current CSS
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

const TextBackgroundColorSelector = ({ ...props }) => {
  const editor = useSlate();
  const currentTextBackgroundColor = getCurrentTextBackgroundColor(editor);

  const handleTextBackgroundColorChange = useCallback(
    (id, colorValue) => {
      toggleInlineTextBackgroundColorFormat(editor, colorValue);
    },
    [editor],
  );

  const handleMouseDown = useCallback((event) => {
    // Prevent mousedown from taking focus away from the editor
    event.preventDefault();
  }, []);

  return (
    <div
      className="text-background-color-selector-wrapper"
      {...props}
      onMouseDown={handleMouseDown}
    >
      <div className="text-background-color-picker-container">
        <SimpleColorPicker
          id="text-background-color"
          value={currentTextBackgroundColor}
          onChange={handleTextBackgroundColorChange}
          style={{
            width: '32px',
            height: '32px',
          }}
        />
      </div>
    </div>
  );
};

export default TextBackgroundColorSelector;
