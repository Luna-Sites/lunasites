import { Editor, Node } from 'slate';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers/Blocks/Blocks';

/**
 * Smart block mutation for slash menu that handles text splitting intelligently
 * Manually manipulates the form data structure instead of using helper functions
 *
 * @param {Object} editor - Slate editor instance
 * @param {string} blockId - Current block ID
 * @param {Object} newBlockData - Data for the new block to create
 * @param {Object} formData - Current form data
 * @returns {Object} { formData: Updated form data, newBlockId: ID of the created block }
 */
export const smartMutateBlock = (editor, blockId, newBlockData, formData) => {
  const { selection } = editor;
  if (!selection) {
    return { formData, newBlockId: null };
  }

  // Get current block from Slate editor
  const [match] = Editor.nodes(editor, {
    match: (n) => Editor.isBlock(editor, n),
    universal: true,
  });

  if (!match) {
    return { formData, newBlockId: null };
  }

  const [currentBlock, blockPath] = match;
  const blockText = Node.string(currentBlock);
  const cursorOffset = Editor.string(editor, {
    anchor: Editor.start(editor, blockPath),
    focus: selection.anchor,
  }).length;

  // Find the current line where slash was typed
  const textBeforeCursor = blockText.slice(0, cursorOffset);
  const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
  const startOfLine = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;

  const textAfterCursor = blockText.slice(cursorOffset);
  const nextNewlineIndex = textAfterCursor.indexOf('\n');
  const endOfLine =
    nextNewlineIndex === -1
      ? blockText.length
      : cursorOffset + nextNewlineIndex;

  const currentLine = blockText.slice(startOfLine, endOfLine);

  // Find where the slash command starts and ends
  const slashMatch = currentLine.match(/^(\s*)\/([a-z]*)(.*)$/);
  if (!slashMatch) return { formData, newBlockId: null };

  const [, leadingSpaces, , textAfterSlash] = slashMatch;

  // Text before the slash line
  const textBeforeSlashLine = blockText.slice(0, startOfLine);
  // Text after the slash line
  const textAfterSlashLine = blockText.slice(endOfLine);

  // Check if the entire block is just whitespace + slash
  const isOnlyWhitespace =
    (textBeforeSlashLine + textAfterSlashLine).trim() === '' &&
    leadingSpaces.length === startOfLine &&
    textAfterSlash.trim() === '';

  // Get form data structure info
  const blocksFieldname = getBlocksFieldname(formData);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(formData);

  // Create a deep copy of formData to avoid mutations
  const newFormData = JSON.parse(JSON.stringify(formData));
  const blocks = newFormData[blocksFieldname];
  const blocksLayout = newFormData[blocksLayoutFieldname];

  let createdBlockId = null;

  if (isOnlyWhitespace) {
    // Case 1: Only whitespace - replace entire block
    blocks[blockId] = newBlockData;
    createdBlockId = blockId; // Focus stays on same block, but it's now the new type
  } else {
    // Case 2 & 3: Has content - need to split intelligently

    // If there's text before slash line, keep it in current block
    if (textBeforeSlashLine.trim()) {
      // Update current block with text before slash
      blocks[blockId] = {
        '@type': 'slate',
        value: [
          {
            type: 'p',
            children: [{ text: textBeforeSlashLine.replace(/\n$/, '') }],
          },
        ],
        plaintext: textBeforeSlashLine.trim(),
      };

      // Generate new block ID for the new block
      const newBlockId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      createdBlockId = newBlockId; // Focus on the new block

      // Add new block after current block
      blocks[newBlockId] = newBlockData;

      // Find current block index in layout
      const currentIndex = blocksLayout.items.indexOf(blockId);

      // Insert new block ID after current block in layout
      blocksLayout.items.splice(currentIndex + 1, 0, newBlockId);

      // If there's text after slash, create additional text block
      if (textAfterSlash.trim() || textAfterSlashLine.trim()) {
        const remainingText = (textAfterSlash + textAfterSlashLine).trim();
        if (remainingText) {
          const afterBlockId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          blocks[afterBlockId] = {
            '@type': 'slate',
            value: [
              {
                type: 'p',
                children: [{ text: remainingText }],
              },
            ],
            plaintext: remainingText,
          };

          // Insert after the new block
          blocksLayout.items.splice(currentIndex + 2, 0, afterBlockId);
        }
      }
    } else {
      // No text before, replace current block with new block
      blocks[blockId] = newBlockData;
      createdBlockId = blockId; // Focus stays on same block, but it's now the new type

      // If there's text after slash, create additional text block
      if (textAfterSlash.trim() || textAfterSlashLine.trim()) {
        const remainingText = (textAfterSlash + textAfterSlashLine).trim();
        if (remainingText) {
          const afterBlockId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          blocks[afterBlockId] = {
            '@type': 'slate',
            value: [
              {
                type: 'p',
                children: [{ text: remainingText }],
              },
            ],
            plaintext: remainingText,
          };

          // Find current block index and insert after it
          const currentIndex = blocksLayout.items.indexOf(blockId);
          blocksLayout.items.splice(currentIndex + 1, 0, afterBlockId);
        }
      }
    }
  }

  return { formData: newFormData, newBlockId: createdBlockId };
};
