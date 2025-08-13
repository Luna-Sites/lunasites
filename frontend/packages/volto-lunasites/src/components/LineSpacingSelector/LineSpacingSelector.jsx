/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import { Dropdown } from 'semantic-ui-react';
import {
  LINE_SPACING_OPTIONS,
  LINE_SPACING_STYLE_PROPS,
} from './lineSpacingOptions';
import './LineSpacingSelector.scss';

const toggleInlineLineSpacingFormat = (editor, lineSpacingClass) => {
  if (!editor.selection) return false;

  // List of all line spacing style properties to remove (with style- prefix)
  const lineSpacingStyleProps = LINE_SPACING_STYLE_PROPS;

  // Remove all existing line spacing marks
  lineSpacingStyleProps.forEach((styleProp) => {
    if (Editor.marks(editor)?.[styleProp]) {
      Editor.removeMark(editor, styleProp);
    }
  });

  // Apply new line spacing mark if specified (with style- prefix)
  if (lineSpacingClass) {
    const styleProp = `style-${lineSpacingClass}`;
    Editor.addMark(editor, styleProp, true);
  }

  return true;
};

const getCurrentLineSpacing = (editor) => {
  if (!editor.selection) return '';
  const marks = Editor.marks(editor);
  if (!marks) return '';

  // Check which line spacing style property is active
  const lineSpacingStyleProps = LINE_SPACING_STYLE_PROPS;

  for (const styleProp of lineSpacingStyleProps) {
    if (marks[styleProp]) {
      // Return the line spacing class without the style- prefix
      return styleProp.substring(6);
    }
  }

  return '';
};

const LineSpacingSelector = ({ ...props }) => {
  const editor = useSlate();
  const currentLineSpacing = getCurrentLineSpacing(editor);

  const handleLineSpacingChange = useCallback(
    (event, { value }) => {
      event.preventDefault();
      event.stopPropagation();
      toggleInlineLineSpacingFormat(editor, value);
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
      className="line-spacing-selector-wrapper"
      {...props}
      onMouseDown={handleMouseDown}
    >
      <Dropdown
        className="line-spacing-selector"
        selection
        compact
        value={currentLineSpacing}
        options={LINE_SPACING_OPTIONS}
        onChange={handleLineSpacingChange}
        renderLabel={renderLabel}
        placeholder="Line Height"
        selectOnBlur={false}
        selectOnNavigation={false}
      />
    </div>
  );
};

export default LineSpacingSelector;
