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

## Implementation Status: ✅ COMPLETED SUCCESSFULLY

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

### Phase 4: Polish & Testing ✅ COMPLETED
- [x] **4.1** Implement proper block rendering and editing
  - ✅ Edit component now renders actual blocks using proper Volto view components
  - ✅ View component updated to match Edit functionality
  - ✅ Added proper block iteration and rendering logic
  - ✅ FloatingAddButton works for both empty and populated sections
  - ✅ Added styling for block rendering areas and unknown block fallbacks
- [x] **4.2** Clean up old group block customizations  
- [x] **4.3** Test across different screen sizes and browsers
- [x] **4.4** Add proper error handling and edge cases

## 🎉 MAJOR MILESTONE: SQUARESPACE-LIKE GRID SYSTEM IMPLEMENTED

### Phase 5: Squarespace-like Grid System Implementation ✅ COMPLETED

#### **5.1** Enhanced Data Structure ✅ COMPLETED
- ✅ Extended blocks_layout to support grid mode and positioning data
- ✅ Added grid configuration (columns, rowHeight, positions)
- ✅ Maintained backward compatibility with existing linear layout
- ✅ Updated PropTypes and default values across all components

#### **5.2** Grid Layout Foundation ✅ COMPLETED  
- ✅ Created GridLayout component with CSS Grid-based positioning
- ✅ Implemented responsive grid system with visual guidelines
- ✅ Added mode toggle to switch between linear and grid layouts
- ✅ Grid guides show on hover for better user experience
- ✅ Mobile-responsive design with graceful degradation

#### **5.3** Drag & Drop System ✅ COMPLETED
- ✅ Integrated react-dnd with HTML5Backend for drag functionality
- ✅ Created DraggableBlock component with drag sources and visual feedback
- ✅ Implemented GridDropZone with visual drop indicators
- ✅ Added drag handles that appear on hover/selection
- ✅ Position coordinates display for debugging (removable)

#### **5.4** Advanced Positioning & Collision Detection ✅ COMPLETED
- ✅ Smart position calculation based on drop coordinates
- ✅ Automatic collision detection and prevention
- ✅ Snap-to-grid functionality for precise positioning
- ✅ Boundary checking to keep blocks within grid limits
- ✅ Auto-positioning for new blocks in available spaces

#### **5.5** User Experience & Visual Polish ✅ COMPLETED
- ✅ Smooth animations and transitions for drag operations  
- ✅ Visual feedback during drag (rotation, opacity changes)
- ✅ Drop zone indicators (green for valid, red for invalid drops)
- ✅ Grid guidelines that appear on hover
- ✅ Responsive design with mobile fallback to linear layout
- ✅ Proper z-index management for dragging elements

## 🎯 IMPLEMENTATION COMPLETE: SQUARESPACE-LIKE GRID SYSTEM

### What's Now Available:
1. **Dual Layout Modes**: Toggle between traditional linear layout and advanced grid layout
2. **Freeform Positioning**: Drag blocks anywhere within a 12-column grid system
3. **Smart Collision Detection**: Blocks automatically avoid overlapping
4. **Visual Feedback**: Real-time drop indicators, drag handles, and grid guidelines
5. **Responsive Design**: Automatically falls back to linear layout on mobile
6. **Backward Compatibility**: Existing sections continue to work unchanged

### Key Components Created:
- **GridLayout**: Core grid positioning system using CSS Grid
- **DraggableBlock**: Wrapper that makes blocks draggable with visual feedback
- **GridDropZone**: Drop target with collision detection and visual indicators
- **DragDropProvider**: React DnD context provider for drag functionality

### Data Structure Enhancement:
```javascript
blocks_layout: {
  items: [blockId1, blockId2],
  mode: 'grid', // 'linear' or 'grid'
  grid: {
    columns: 12,
    rowHeight: 60,
    positions: {
      blockId1: { x: 0, y: 0, width: 6, height: 4 },
      blockId2: { x: 6, y: 0, width: 6, height: 3 }
    }
  }
}
```

### Future Enhancements (Optional):
- Block resize handles for dynamic sizing
- Advanced grid configuration controls
- Copy/paste block functionality
- Keyboard navigation support

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