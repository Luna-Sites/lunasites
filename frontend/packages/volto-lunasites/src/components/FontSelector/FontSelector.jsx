import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import { Dropdown } from 'semantic-ui-react';
import { FONT_OPTIONS, FONT_STYLE_PROPS } from './fontOptions';
import './FontSelector.scss';

const toggleInlineFontFormat = (editor, fontClass) => {
  if (!editor.selection) return false;

  // List of all font style properties to remove (with style- prefix)
  const fontStyleProps = FONT_STYLE_PROPS;

  // Remove all existing font marks
  fontStyleProps.forEach((styleProp) => {
    if (Editor.marks(editor)?.[styleProp]) {
      Editor.removeMark(editor, styleProp);
    }
  });

  // Apply new font mark if specified (with style- prefix)
  if (fontClass) {
    const styleProp = `style-${fontClass}`;
    Editor.addMark(editor, styleProp, true);
  }

  return true;
};

const getCurrentFont = (editor) => {
  if (!editor.selection) return '';
  const marks = Editor.marks(editor);
  if (!marks) return '';

  // Check which font style property is active
  const fontStyleProps = FONT_STYLE_PROPS;

  for (const styleProp of fontStyleProps) {
    if (marks[styleProp]) {
      // Return the font class without the style- prefix
      return styleProp.substring(6);
    }
  }

  return '';
};

const FontSelector = ({ ...props }) => {
  const editor = useSlate();
  const currentFont = getCurrentFont(editor);

  const handleFontChange = useCallback(
    (event, { value }) => {
      event.preventDefault();
      event.stopPropagation();
      toggleInlineFontFormat(editor, value);
    },
    [editor],
  );

  const handleMouseDown = useCallback((event) => {
    // Prevent mousedown from taking focus away from the editor
    event.preventDefault();
  }, []);

  const renderLabel = (label) => ({
    content: label.text,
    style: label.style,
  });

  return (
    <div
      className="font-selector-wrapper"
      {...props}
      onMouseDown={handleMouseDown}
    >
      <Dropdown
        className="font-selector"
        selection
        compact
        value={currentFont}
        options={FONT_OPTIONS}
        onChange={handleFontChange}
        renderLabel={renderLabel}
        placeholder="Font"
        selectOnBlur={false}
        selectOnNavigation={false}
      />
    </div>
  );
};

export default FontSelector;
