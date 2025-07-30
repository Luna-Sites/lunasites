import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms } from 'slate';
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

const isBlockFontActive = (editor, fontClass) => {
  if (!editor.selection) return false;
  const levels = Array.from(Editor.levels(editor, editor.selection));
  if (levels.length < 2) return false;
  const [, [node]] = levels;
  return node.styleName === fontClass;
};

const toggleBlockFontFormat = (editor, fontClass) => {
  const levels = Array.from(Editor.levels(editor, editor.selection));
  if (levels.length < 2) return false;
  const [, [, path]] = levels;
  
  Transforms.setNodes(
    editor,
    { styleName: fontClass || undefined },
    {
      at: path,
    },
  );
  return true;
};

const getCurrentFont = (editor) => {
  if (!editor.selection) return '';
  const levels = Array.from(Editor.levels(editor, editor.selection));
  if (levels.length < 2) return '';
  const [, [node]] = levels;
  return node.styleName || '';
};

const FontSelector = ({ ...props }) => {
  const editor = useSlate();
  const currentFont = getCurrentFont(editor);

  const handleFontChange = useCallback(
    (event, { value }) => {
      event.preventDefault();
      toggleBlockFontFormat(editor, value);
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
