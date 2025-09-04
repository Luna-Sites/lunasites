# Block Copy-Paste Feature

## Overview
This feature adds keyboard shortcuts for copying, cutting, and pasting blocks in the Volto editor, making content management more efficient.

## Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| **Ctrl/Cmd + C** | Copy | Copies selected block(s) to clipboard |
| **Ctrl/Cmd + X** | Cut | Cuts selected block(s) to clipboard (removes from page) |
| **Ctrl/Cmd + V** | Paste | Pastes block(s) from clipboard after the currently selected block |

## Features

### Single Block Operations
- Select a block by clicking on it
- Use Ctrl/Cmd + C to copy or Ctrl/Cmd + X to cut
- Navigate to where you want to paste
- Use Ctrl/Cmd + V to paste after the selected block

### Multi-Block Operations
- Select multiple blocks using:
  - **Ctrl/Cmd + Click**: Toggle individual blocks in selection
  - **Shift + Click**: Select a range of blocks
- Copy/cut all selected blocks at once
- Paste maintains the original order of blocks

### Cross-Page/Tab Support
- Clipboard data is synchronized via localStorage
- Copy blocks on one page/tab and paste on another
- Works across different browser tabs with the same site

### Smart Context Detection
- Shortcuts only work when blocks are selected (not when editing text)
- Normal text copy/paste works within text editors (Slate blocks)
- Prevents accidental overrides of system clipboard when editing content

## Technical Implementation

### Architecture
- **Hook**: `useBlockCopyPaste` - Handles keyboard events and clipboard operations
- **Component**: Enhanced `BlocksForm` - Integrates the hook with Volto's block system
- **Storage**: Uses Redux state + localStorage for persistence

### Block Cloning
- Copy mode: Creates new UUIDs for pasted blocks (duplicates)
- Cut mode: Preserves original UUIDs (moves blocks)
- Supports complex nested block structures

### Integration Points
- Leverages existing Volto clipboard actions
- Works with all block types
- Maintains block configurations and settings

## User Feedback
- Toast notifications indicate successful operations
- Shows number of blocks copied/cut/pasted
- Clear visual feedback for all operations

## Browser Compatibility
- Works in all modern browsers
- Automatically detects Mac vs PC for Cmd/Ctrl key handling
- Graceful fallback if localStorage is unavailable