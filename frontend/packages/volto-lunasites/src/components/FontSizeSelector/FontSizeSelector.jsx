import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import { Dropdown } from 'semantic-ui-react';
import './FontSizeSelector.scss';

const FONT_SIZE_OPTIONS = [
  {
    key: 'default',
    value: '',
    text: 'Default',
    style: { fontSize: 'inherit' },
  },
  {
    key: '12px',
    value: 'font-size-12',
    text: '12px',
    style: { fontSize: '12px' },
  },
  {
    key: '14px',
    value: 'font-size-14',
    text: '14px',
    style: { fontSize: '14px' },
  },
  {
    key: '16px',
    value: 'font-size-16',
    text: '16px',
    style: { fontSize: '16px' },
  },
  {
    key: '18px',
    value: 'font-size-18',
    text: '18px',
    style: { fontSize: '18px' },
  },
  {
    key: '20px',
    value: 'font-size-20',
    text: '20px',
    style: { fontSize: '20px' },
  },
  {
    key: '24px',
    value: 'font-size-24',
    text: '24px',
    style: { fontSize: '24px' },
  },
  {
    key: '28px',
    value: 'font-size-28',
    text: '28px',
    style: { fontSize: '28px' },
  },
  {
    key: '32px',
    value: 'font-size-32',
    text: '32px',
    style: { fontSize: '32px' },
  },
  {
    key: '36px',
    value: 'font-size-36',
    text: '36px',
    style: { fontSize: '36px' },
  },
  {
    key: '48px',
    value: 'font-size-48',
    text: '48px',
    style: { fontSize: '48px' },
  },
];

const toggleInlineFontSizeFormat = (editor, fontSizeClass) => {
  if (!editor.selection) return false;

  // List of all font size style properties to remove (with style- prefix)
  const fontSizeStyleProps = [
    'style-font-size-12',
    'style-font-size-14',
    'style-font-size-16',
    'style-font-size-18',
    'style-font-size-20',
    'style-font-size-24',
    'style-font-size-28',
    'style-font-size-32',
    'style-font-size-36',
    'style-font-size-48',
  ];

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
  const fontSizeStyleProps = [
    'style-font-size-12',
    'style-font-size-14',
    'style-font-size-16',
    'style-font-size-18',
    'style-font-size-20',
    'style-font-size-24',
    'style-font-size-28',
    'style-font-size-32',
    'style-font-size-36',
    'style-font-size-48',
  ];

  for (const styleProp of fontSizeStyleProps) {
    if (marks[styleProp]) {
      // Return the font size class without the style- prefix
      return styleProp.substring(6);
    }
  }

  return '';
};

const FontSizeSelector = ({ ...props }) => {
  console.log('FontSizeSelector');
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
