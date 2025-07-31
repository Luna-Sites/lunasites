import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import { Dropdown } from 'semantic-ui-react';
import './FontSelector.scss';

const FONT_OPTIONS = [
  {
    key: 'default',
    value: '',
    text: 'Default',
    style: { fontFamily: 'inherit' },
  },
  {
    key: 'inter',
    value: 'font-inter',
    text: 'Inter',
    style: { fontFamily: 'Inter, sans-serif' },
  },
  {
    key: 'metropolis',
    value: 'font-metropolis',
    text: 'Metropolis',
    style: { fontFamily: 'Metropolis, sans-serif' },
  },
  {
    key: 'arial',
    value: 'font-arial',
    text: 'Arial',
    style: { fontFamily: 'Arial, sans-serif' },
  },
  {
    key: 'helvetica',
    value: 'font-helvetica',
    text: 'Helvetica',
    style: { fontFamily: 'Helvetica, sans-serif' },
  },
  {
    key: 'times',
    value: 'font-times',
    text: 'Times New Roman',
    style: { fontFamily: 'Times New Roman, serif' },
  },
  {
    key: 'georgia',
    value: 'font-georgia',
    text: 'Georgia',
    style: { fontFamily: 'Georgia, serif' },
  },
  {
    key: 'courier',
    value: 'font-courier',
    text: 'Courier New',
    style: { fontFamily: 'Courier New, monospace' },
  },
];

const toggleInlineFontFormat = (editor, fontClass) => {
  if (!editor.selection) return false;

  // List of all font style properties to remove (with style- prefix)
  const fontStyleProps = [
    'style-font-inter',
    'style-font-metropolis',
    'style-font-arial',
    'style-font-helvetica',
    'style-font-times',
    'style-font-georgia',
    'style-font-courier',
  ];

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
  const fontStyleProps = [
    'style-font-inter',
    'style-font-metropolis',
    'style-font-arial',
    'style-font-helvetica',
    'style-font-times',
    'style-font-georgia',
    'style-font-courier',
  ];

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
      toggleInlineFontFormat(editor, value);
    },
    [editor],
  );

  const renderLabel = (label) => ({
    content: label.text,
    style: label.style,
  });

  return (
    <div className="font-selector-wrapper" {...props}>
      <Dropdown
        className="font-selector"
        selection
        compact
        value={currentFont}
        options={FONT_OPTIONS}
        onChange={handleFontChange}
        renderLabel={renderLabel}
        placeholder="Font"
        icon="font"
      />
    </div>
  );
};

export default FontSelector;
