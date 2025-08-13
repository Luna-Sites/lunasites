import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import { Dropdown } from 'semantic-ui-react';
import { FONT_SIZE_OPTIONS, FONT_SIZE_STYLE_PROPS } from './fontSizeOptions';
import './FontSizeSelector.scss';

const toggleInlineFontSizeFormat = (editor, fontSizeClass) => {
  if (!editor.selection) return false;

  // List of all font size style properties to remove (with style- prefix)
  const fontSizeStyleProps = FONT_SIZE_STYLE_PROPS;

  // Remove all existing font size marks
  fontSizeStyleProps.forEach((styleProp) => {
    if (Editor.marks(editor)?.[styleProp]) {
      Editor.removeMark(editor, styleProp);
    }
  });

  // Apply new font size mark if specified (with style- prefix)
  if (fontSizeClass) {
    const styleProp = `style-${fontSizeClass}`;
    Editor.addMark(editor, styleProp, true);
  }

  return true;
};

const getCurrentFontSize = (editor) => {
  if (!editor.selection) return '';
  const marks = Editor.marks(editor);
  if (!marks) return '';

  // Check which font size style property is active
  const fontSizeStyleProps = FONT_SIZE_STYLE_PROPS;

  for (const styleProp of fontSizeStyleProps) {
    if (marks[styleProp]) {
      // Return the font size class without the style- prefix
      return styleProp.substring(6);
    }
  }

  return '';
};

const FontSizeSelector = ({ ...props }) => {
  const editor = useSlate();
  const currentFontSize = getCurrentFontSize(editor);

  const handleFontSizeChange = useCallback(
    (event, { value }) => {
      event.preventDefault();
      event.stopPropagation();
      toggleInlineFontSizeFormat(editor, value);
    },
    [editor],
  );

  const handleMouseDown = useCallback((event) => {
    // Prevent mousedown from taking focus away from the editor
    event.preventDefault();
  }, []);

  const renderLabel = (label) => ({
    content: label.text,
  });

  return (
    <div
      className="font-size-selector-wrapper"
      {...props}
      onMouseDown={handleMouseDown}
    >
      <Dropdown
        className="font-size-selector"
        selection
        compact
        value={currentFontSize}
        options={FONT_SIZE_OPTIONS}
        onChange={handleFontSizeChange}
        renderLabel={renderLabel}
        placeholder="Size"
        selectOnBlur={false}
        selectOnNavigation={false}
      />
    </div>
  );
};

export default FontSizeSelector;
