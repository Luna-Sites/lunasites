import React from 'react';
import { Editor, Node } from 'slate';
import { ReactEditor } from 'slate-react';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import { Menu } from 'semantic-ui-react';
import { useIntl, FormattedMessage } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import useUser from '@plone/volto/hooks/user/useUser';
import { smartMutateBlock } from '../../../../../helpers/SmartBlockMutation';

const emptySlateBlock = () => ({
  value: [
    {
      children: [
        {
          text: '',
        },
      ],
      type: 'p',
    },
  ],
  plaintext: '',
});

const useIsMounted = () => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = true;
    return () => (ref.current = false);
  }, []);
  return ref.current;
};

const SlashMenu = ({
  currentBlock,
  onMutateBlock,
  selected,
  availableBlocks,
  menuPosition,
  editor,
  properties,
  onChangeFormData,
  onSelectBlock,
}) => {
  const intl = useIntl();

  const menuStyle = menuPosition
    ? {
        position: 'absolute',
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        zIndex: 1000,
      }
    : {};

  return (
    <div className="power-user-menu" style={menuStyle}>
      <Menu vertical fluid borderless>
        {availableBlocks.map((block, index) => (
          <Menu.Item
            key={block.id}
            className={block.id}
            active={index === selected}
            onClick={(e) => {
              const newBlockData = { '@type': block.id };

              // Use smart mutation if we have access to form data
              if (properties && onChangeFormData && editor) {
                try {
                  const result = smartMutateBlock(
                    editor,
                    currentBlock,
                    newBlockData,
                    properties,
                  );
                  onChangeFormData(result.formData);

                  // Focus on the new block if one was created
                  if (result.newBlockId && onSelectBlock) {
                    onSelectBlock(result.newBlockId);
                  }
                } catch (error) {
                  console.error(
                    'Smart mutation failed, falling back to standard:',
                    error,
                  );
                  onMutateBlock(currentBlock, newBlockData);
                }
              } else {
                // Fallback to standard mutation
                onMutateBlock(currentBlock, newBlockData);
              }

              e.stopPropagation();
            }}
          >
            <Icon name={block.icon} size="24px" />
            {intl.formatMessage({
              id: block.title,
              defaultMessage: block.title,
            })}
          </Menu.Item>
        ))}
        {availableBlocks.length === 0 && (
          <Menu.Item>
            <FormattedMessage
              id="No matching blocks"
              defaultMessage="No matching blocks"
            />
          </Menu.Item>
        )}
      </Menu>
    </div>
  );
};

const translateBlockTitle = (block, intl) =>
  intl.formatMessage({
    id: block.title,
    defaultMessage: block.title,
  });

const scoreBlock = (block, slashCommand, intl) => {
  if (!slashCommand) return 0;
  const title = translateBlockTitle(block, intl).toLowerCase();
  if (title.indexOf(slashCommand[1]) === 0) return 2;
  if (title.indexOf(slashCommand[1]) !== -1) return 1;
};

// Helper function to get the current line text
const getCurrentLineText = (editor) => {
  const { selection } = editor;
  if (!selection) return '';

  // Get current block
  const [match] = Editor.nodes(editor, {
    match: (n) => Editor.isBlock(editor, n),
    universal: true,
  });

  if (!match) return '';

  const [block] = match;
  const blockText = Node.string(block);
  const cursorOffset = selection.anchor.offset;

  // Find the current line by looking for newlines before and after cursor
  const textBeforeCursor = blockText.slice(0, cursorOffset);
  const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
  const startOfLine = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;

  const textAfterCursor = blockText.slice(cursorOffset);
  const nextNewlineIndex = textAfterCursor.indexOf('\n');
  const endOfLine =
    nextNewlineIndex === -1
      ? blockText.length
      : cursorOffset + nextNewlineIndex;

  return blockText.slice(startOfLine, endOfLine);
};

// Helper function to calculate menu position relative to current line
const getMenuPosition = (editor) => {
  const { selection } = editor;
  if (!selection) return null;

  try {
    // Use ReactEditor to get DOM node at current selection
    const domNode = ReactEditor.toDOMNode(editor, editor);
    const domRange = ReactEditor.toDOMRange(editor, selection);
    const rect = domRange.getBoundingClientRect();

    // Get the editor container
    const editorRect = domNode.getBoundingClientRect();

    // Position menu relative to the editor container
    return {
      top: rect.bottom - editorRect.top + 5, // 5px below cursor, relative to editor
      left: rect.left - editorRect.left,
    };
  } catch (error) {
    // Fallback: return null to use default positioning
    return null;
  }
};

/**
 * A SlashMenu wrapper implemented as a volto-slate PersistentHelper.
 * This is a customized version that checks only the current line for slash commands
 * instead of the entire block text.
 */
const PersistentSlashMenu = ({ editor }) => {
  const props = editor.getBlockProps();
  const intl = useIntl();
  const {
    block,
    blocksConfig,
    data,
    onMutateBlock,
    properties,
    selected,
    allowedBlocks,
    detached,
    navRoot,
    contentType,
    onChangeFormData,
    onSelectBlock,
  } = props;
  const disableNewBlocks = data?.disableNewBlocks || detached;

  const user = useUser();

  const [slashMenuSelected, setSlashMenuSelected] = React.useState(0);

  const hasAllowedBlocks = !isEmpty(allowedBlocks);

  // Get current line text instead of entire block text (data.plaintext)
  const currentLineText = getCurrentLineText(editor);
  const slashCommand = currentLineText
    ?.toLowerCase()
    .trim()
    .match(/^\/([a-z]*)$/);

  // Get menu position relative to current line
  const menuPosition = getMenuPosition(editor);

  const availableBlocks = React.useMemo(
    () =>
      filter(blocksConfig, (item) =>
        hasAllowedBlocks
          ? allowedBlocks.includes(item.id)
          : typeof item.restricted === 'function'
            ? !item.restricted({
                properties,
                block: item,
                navRoot,
                contentType,
                user,
              })
            : !item.restricted,
      )
        .filter((block) => Boolean(block.title && block.id))
        .filter((block) => {
          const title = translateBlockTitle(block, intl).toLowerCase();
          return (
            block.id !== 'slate' &&
            slashCommand &&
            title.indexOf(slashCommand[1]) !== -1
          );
        })
        .sort((a, b) => {
          const scoreDiff =
            scoreBlock(b, slashCommand, intl) -
            scoreBlock(a, slashCommand, intl);
          if (scoreDiff) return scoreDiff;
          return translateBlockTitle(a, intl).localeCompare(
            translateBlockTitle(b, intl),
          );
        }),
    [
      allowedBlocks,
      blocksConfig,
      intl,
      properties,
      slashCommand,
      hasAllowedBlocks,
      navRoot,
      contentType,
      user,
      currentLineText, // Add dependency on current line text
    ],
  );

  const slashMenuSize = availableBlocks.length;
  const show = selected && slashCommand && !disableNewBlocks;

  const isMounted = useIsMounted();

  React.useEffect(() => {
    if (isMounted && show && slashMenuSelected > slashMenuSize - 1) {
      setSlashMenuSelected(slashMenuSize - 1);
    }
  }, [show, slashMenuSelected, isMounted, slashMenuSize]);

  editor.showSlashMenu = show;

  editor.slashEnter = () => {
    if (slashMenuSize === 0) return;

    const newBlockData = { '@type': availableBlocks[slashMenuSelected].id };

    // Use smart mutation if we have access to form data
    if (properties && onChangeFormData) {
      try {
        const result = smartMutateBlock(
          editor,
          block,
          newBlockData,
          properties,
        );
        onChangeFormData(result.formData);

        // Focus on the new block if one was created
      } catch (error) {
        console.error(
          'Smart mutation failed, falling back to standard:',
          error,
        );
        onMutateBlock(block, newBlockData, emptySlateBlock());
      }
    } else {
      // Fallback to standard mutation
      onMutateBlock(block, newBlockData, emptySlateBlock());
    }
  };

  editor.slashArrowUp = () =>
    setSlashMenuSelected(
      slashMenuSelected === 0 ? slashMenuSize - 1 : slashMenuSelected - 1,
    );

  editor.slashArrowDown = () =>
    setSlashMenuSelected(
      slashMenuSelected >= slashMenuSize - 1 ? 0 : slashMenuSelected + 1,
    );

  return show ? (
    <SlashMenu
      currentBlock={block}
      onMutateBlock={onMutateBlock}
      availableBlocks={availableBlocks}
      selected={slashMenuSelected}
      menuPosition={menuPosition}
      editor={editor}
      properties={properties}
      onChangeFormData={onChangeFormData}
      onSelectBlock={onSelectBlock}
    />
  ) : (
    ''
  );
};

export default PersistentSlashMenu;
