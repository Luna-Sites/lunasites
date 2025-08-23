import { Editor, Transforms, Node } from 'slate';

export const customEnterHandler = ({ editor, event }) => {
  if (
    event.key !== 'Enter' ||
    event.shiftKey ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey
  ) {
    return false;
  }

  // If slash menu is showing, don't handle Enter here - let slash menu handle it
  if (editor.showSlashMenu) {
    return false;
  }

  const { selection } = editor;
  if (!selection) return false;

  // Get current block
  const [match] = Editor.nodes(editor, {
    match: (n) => Editor.isBlock(editor, n),
    universal: true,
  });

  if (!match) return false;

  const [block, blockPath] = match;

  // Get the text content of the current block
  const blockText = Node.string(block);

  // Get cursor position within the block
  const cursorOffset = selection.anchor.offset;

  // Check if cursor is at the end of a line that ends with newline
  const textBeforeCursor = blockText.slice(0, cursorOffset);

  // Check if we're at the end of the block or on an empty line
  const isAtEndOfBlock = cursorOffset === blockText.length;
  const isOnEmptyLine =
    textBeforeCursor.endsWith('\n') ||
    (textBeforeCursor === '' && isAtEndOfBlock);

  // Double Enter scenario: cursor is on an empty line (after a newline or at start of empty block)
  if (isOnEmptyLine && (textBeforeCursor.endsWith('\n') || blockText === '')) {
    // If we're on an empty line that was created by a previous newline, remove it first
    if (textBeforeCursor.endsWith('\n') && blockText.length > 0) {
      // Check if the text node exists and has content
      const paragraphNode = block.children[0];
      const actualTextNode = paragraphNode?.children?.[0];
      if (
        actualTextNode &&
        actualTextNode.text &&
        actualTextNode.text.endsWith('\n')
      ) {
        // Remove the newline character
        Transforms.delete(editor, {
          at: {
            anchor: {
              path: [...blockPath, 0, 0],
              offset: actualTextNode.text.length - 1,
            },
            focus: {
              path: [...blockPath, 0, 0],
              offset: actualTextNode.text.length,
            },
          },
        });
      }
    }

    // Don't prevent the event, let Volto handlers create new block
    return false;
  } else {
    // Single Enter - just insert newline
    event.preventDefault();
    editor.insertText('\n');
    return true;
  }
};
