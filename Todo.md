# Implementation Plan: Fix Section Block Chooser Layout

## Problem Analysis
When a blank section is added, it currently auto-adds a slate block which creates awkward positioning for the block chooser modal. The modal gets pushed too far to the right, creating a poor user experience.

## Solution Overview
Create a custom section block that shows a floating "add block" button instead of auto-creating slate blocks.

## What's Been Done 

### Phase 1: Initial Attempts & Learning
-  **1.1** Created `blankSection` template in `sectionTemplates.js` - creates empty group blocks
-  **1.2** Enhanced group block styling in `_group.scss` - sections now look bigger and better
-  **1.3** Created `FloatingAddButton` component - clean button with CompactBlockChooser integration
-  **1.4** Attempted group block customizations - created Edit.jsx and DefaultBody.jsx overrides
-  **1.5** Confirmed customizations work - red border test shows files are loading
- L **Issue**: Group block system fights against customizations, infinite re-renders, auto-slate creation

### Key Learnings:
- Volto customization system works (confirmed with red border test)
- Group block has complex auto-slate logic that's hard to override cleanly  
- FloatingAddButton component is ready and functional
- Section styling improvements are working well

## What Needs To Be Done Next =�

### Phase 2: Create Custom Section Block ✅ COMPLETED
- [x] **2.1** Create a new `CustomSectionBlock` component from scratch
  - Created `/components/CustomSectionBlock/` directory with Edit.jsx, View.jsx, Schema.js, index.js
- [x] **2.2** Register the custom block in Volto's block configuration
  - Added `customSection` block type to main addon configuration
  - Imported and configured with proper settings (icon, group, schema, etc.)
- [x] **2.3** Create Edit and View components for the custom section
  - **Edit.jsx**: Handles empty state with FloatingAddButton, integrates BlocksForm for content management
  - **View.jsx**: Renders section title and blocks using RenderBlocks
  - **Schema.js**: Basic schema with title field
- [x] **2.4** Implement clean empty state with FloatingAddButton integration
  - Empty sections show FloatingAddButton instead of auto-creating slate blocks
  - CompactBlockChooser integration for block selection
- [x] **2.5** Add block management (add, delete, reorder) within the custom section
  - Used Volto's BlocksForm component for full block management
  - Handles block addition, deletion, reordering automatically
- [x] **2.6** Style the custom section to match the enhanced group styling
  - Created CustomSectionBlock.scss with enhanced styling
  - Integrated styles into main theme file
  - Matches existing group block visual treatment

### Phase 3: Integration & Template Updates 🚧 IN PROGRESS
- [x] **3.1** Update `sectionTemplates.js` to use the new custom section block
- [x] **3.2** Fix infinite re-render loop causing page freeze
  - Removed problematic `BlocksForm` integration that caused re-render loops
  - Simplified Edit component to focus on core functionality (title + add blocks)
  - Created proof-of-concept version that doesn't crash
- [x] **3.3** Test section creation and block addition workflow
  - ✅ No crashes or freezing
  - ✅ FloatingAddButton opens CompactBlockChooser
  - ✅ Blocks can be added successfully

### Phase 4: Polish & Testing 🚧 IN PROGRESS  
- [x] **4.1** Implement proper block rendering and editing
  - ✅ Edit component now renders actual blocks using proper Volto view components
  - ✅ View component updated to match Edit functionality
  - ✅ Added proper block iteration and rendering logic
  - ✅ FloatingAddButton works for both empty and populated sections
  - ✅ Added styling for block rendering areas and unknown block fallbacks
- [ ] **4.2** Clean up old group block customizations  
- [ ] **4.3** Test across different screen sizes and browsers
- [ ] **4.4** Add proper error handling and edge cases

## Technical Approach

### New Architecture:
- **Custom Block Type**: `@type: 'customSection'` instead of relying on group blocks
- **Clean Empty State**: No auto-slate creation, just FloatingAddButton
- **Direct Control**: Full control over rendering and block management
- **Reuse Components**: Leverage existing FloatingAddButton and CompactBlockChooser

### Key Files to Create:
1. `frontend/packages/volto-lunasites/src/components/CustomSectionBlock/`
2. Block registration in addon configuration
3. Update `sectionTemplates.js` to use custom block

### Benefits of This Approach:
- No conflicts with existing group block system
- Complete control over empty state behavior  
- Cleaner, more predictable implementation
- Can reuse all the components already built