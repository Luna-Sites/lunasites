# 12-Column CSS Grid Migration Plan

## Overview
Migrating from pixel-based FreeformGrid to a responsive 12-column CSS Grid system while preserving all existing functionality.

## Implementation Progress

### Phase 1: Data Structure & Migration ✅

#### 1.1 Extend Block Data Model ✅
- [x] Add `gridColumn` property (1-12)
- [x] Add `gridRow` property
- [x] Add `columnSpan` property (1-12)
- [x] Add `rowSpan` property
- [x] Keep existing `position` and `containerSize` for backwards compatibility
- [x] Update Schema.js with new grid properties

#### 1.2 Create Migration Utility ✅
- [x] Create `utils/gridMigration.js`
- [x] Function to convert pixel X to grid column
- [x] Function to calculate column span from pixel width
- [x] Function to auto-generate rows from Y positions
- [x] Handle edge cases and overlapping blocks

### Phase 2: New Grid Component ✅

#### 2.1 Create Grid12Layout Component ✅
- [x] Create `Grid12Layout.jsx`
- [x] Create `Grid12Layout.scss`
- [x] Implement 12-column CSS Grid layout
- [x] Add dynamic row generation
- [x] Add visual grid overlay for edit mode
- [x] Handle block rendering within grid cells

#### 2.2 Implement Grid-Aware Drag & Drop ✅
- [x] Calculate grid cell under cursor
- [x] Show drop zone indicators
- [x] Implement snap-to-grid logic
- [x] Prevent block overlapping
- [x] Update block grid properties on drop

#### 2.3 Add Grid-Based Resizing ✅
- [x] Resize by changing columnSpan/rowSpan
- [x] Show resize handles at grid boundaries
- [x] Display column/row count during resize
- [x] Enforce minimum and maximum spans
- [x] Handle edge cases at grid boundaries

### Phase 3: Responsive Behavior ✅

#### 3.1 Implement Breakpoints ✅
- [x] Desktop: 12 columns (≥1024px)
- [x] Tablet: 6 columns (768px-1023px)
- [x] Mobile: 1 column stack (<768px)
- [x] Maintain relative positions across breakpoints
- [x] Test with different screen sizes

#### 3.2 Handle Dynamic Content ✅
- [x] Text blocks auto-grow within cells
- [x] Images maintain aspect ratio
- [x] Buttons scale appropriately
- [x] Test with various content types

### Phase 4: Integration ✅

#### 4.1 Update Edit Component ✅
- [x] Add "grid" mode to layout options
- [x] Implement mode switching logic
- [x] Add migration prompt when switching
- [x] Preserve block data during mode changes
- [x] Update UI to show current mode

#### 4.2 Update View Component ✅
- [x] Render grid layouts using CSS Grid
- [x] Handle responsive behavior
- [x] Maintain backwards compatibility
- [x] Test with existing content

#### 4.3 Update Schema ✅
- [x] Add grid layout option
- [x] Add grid configuration settings
- [x] Document new properties

### Phase 5: Testing & Polish ⬜

#### 5.1 Critical Scenarios ⬜
- [ ] Test sidebar toggle behavior
- [ ] Test zoom levels (50%, 75%, 100%, 125%, 150%)
- [ ] Test content migration
- [ ] Test with all block types
- [ ] Test undo/redo functionality

#### 5.2 Edge Cases ⬜
- [ ] Empty sections
- [ ] Single block sections
- [ ] Maximum blocks (stress test)
- [ ] Mixed content types
- [ ] Browser compatibility

#### 5.3 Documentation ⬜
- [ ] Update component documentation
- [ ] Add migration guide
- [ ] Document grid system behavior
- [ ] Add usage examples

## Drag & Drop Final Fix ✅

### The Real Problem
- Mouse position wasn't correctly mapping to CSS Grid cells
- Padding and gaps weren't properly accounted for
- Mixing coordinate systems between overlay and actual grid

### Correct Solution Implemented ✅
- [x] Calculate based on actual CSS Grid container dimensions
- [x] Fixed padding values: left/right = 16px, top = 48px (16px + 32px header)
- [x] Proper gap calculation: `cellWidth = (gridWidth - totalGaps) / columns`
- [x] Column position: Account for pattern (cell, gap, cell, gap...)
- [x] Add half gap to handle clicks between cells
- [x] Preview and blocks in same grid context
- [x] Debug logging to verify calculations

### Key Formula
```javascript
// CSS Grid with gaps:
totalGaps = gap * (columns - 1)
cellWidth = (gridWidth - totalGaps) / columns
cellPlusGap = cellWidth + gap

// Position calculation:
gridColumn = Math.floor((mouseX + gap/2) / cellPlusGap) + 1
```

### Result
- Accurate grid positioning
- Blocks drop exactly where mouse is
- Preview aligns perfectly with drop location
- Works across entire grid

## Grid Resize Enhancement ✅

### Fix Core Calculations ✅
- [x] Update column width calculation to account for gaps
- [x] Fix row height calculation with gaps  
- [x] Add computed style detection for accurate padding
- [x] Add 40% snapping threshold for smoother resize

### Enhance Visual Feedback ✅
- [x] Highlight affected grid cells during resize
- [x] Improve size indicator styling and positioning
- [x] Add grid cell highlighting for resize preview
- [x] Show column × row format in indicator

### Improve User Experience ✅
- [x] Add smooth transitions for resize preview
- [x] Show boundary indicators when hitting limits
- [ ] Test with different zoom levels (50%-150%)
- [ ] Verify responsive behavior at different screen sizes

### Testing ⬜
- [ ] Test with text blocks (auto-growing content)
- [ ] Test with image blocks (aspect ratio)
- [ ] Test with button blocks (fixed size)
- [ ] Test edge cases (min/max spans, boundaries)
- [ ] Test performance with multiple blocks

## Text Block Resize Fix ✅

### Problem Identified
- Text blocks were scaling font size during resize operations
- Expected behavior: Container resizes, text reflows naturally
- Actual behavior: Font size increased/decreased with container size

### Root Cause
- `calculateTextProperties()` was calculating font size based on container width
- "Squarespace-style" unified resizing was over-engineered for text blocks
- Font size should be controlled by text editor, not resize operations

### Solution Implemented ✅
- [x] Modified `calculateTextProperties()` to return empty object
- [x] Removed fontSize CSS variable from text wrapper
- [x] Text now reflows naturally within resized container
- [x] Font size remains under user control via text editor
- [x] Container resize only affects dimensions, not content properties

## Auto-Expanding Text Blocks ✅

### Problem
- Text blocks overflow their containers when content is pasted/typed
- Users had to manually resize blocks after adding content
- Text appeared outside visual boundaries creating confusion

### Solution Implemented ✅
- [x] Added content measurement using refs and ResizeObserver
- [x] Calculate required rows based on actual content height
- [x] Auto-update rowSpan when content changes
- [x] Keep content within boundaries (no overflow)
- [x] Preserve manual resize as minimum height
- [x] Text blocks start with 2 rows by default

### Technical Details
- Uses `scrollHeight` to measure actual content
- Divides by row height (60px + gap) to get required rows
- Only expands, never shrinks below manual setting
- ResizeObserver monitors content changes in real-time
- Manual resize sets `manualRowSpan` as minimum

### Files Modified
- `Grid12Layout.jsx` - Added measurement logic and auto-expand
- `Grid12Layout.scss` - Removed overflow:visible, added proper boundaries
- `Edit.jsx` - Text blocks start with 2 rows default

## Current Status
✅ Phase 1: Data Structure & Migration - COMPLETED
✅ Phase 2: New Grid Component - COMPLETED  
✅ Phase 3: Responsive Behavior - COMPLETED
✅ Phase 4: Integration - COMPLETED
✅ Drag & Drop Rewrite - COMPLETED
✅ Grid Resize Enhancement - COMPLETED
✅ Text Block Resize Fix - COMPLETED
⬜ Phase 5: Testing & Polish - PENDING

## Notes
- Maintaining backwards compatibility is critical
- All existing freeform layouts must continue working
- New sections will default to grid mode
- One-click migration available with preview
- Ability to revert if needed

## Files Reference
- **New Files to Create**:
  - `Grid12Layout.jsx`
  - `Grid12Layout.scss`
  - `utils/gridMigration.js`
  
- **Files to Modify**:
  - `Edit.jsx` - Add grid mode support
  - `View.jsx` - Add grid rendering
  - `Schema.js` - Add grid properties
  - `Edit.scss` - Add grid mode styles
  - `View.scss` - Add grid view styles

## Migration Strategy
1. Parallel implementation - Grid12Layout alongside FreeformGrid
2. Gradual rollout - Users can opt-in to grid mode
3. Automatic migration tools for existing content
4. Full backwards compatibility maintained
5. Eventually deprecate FreeformGrid after stability confirmed