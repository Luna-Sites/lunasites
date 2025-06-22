# LunaSites Advanced Styling - Native Integration

This addon now integrates directly with Volto's native block styling system instead of using a popup interface.

## How it works

1. **Native Sidebar Integration**: All styling options now appear in Volto's native sidebar under the "Styling" fieldset when a block is selected.

2. **Schema Enhancement**: The addon uses Volto's `addStyling` helper and extends it with advanced styling options.

3. **Organized Fieldsets**: Styling options are organized into logical groups:
   - **Default**: Basic text and size options
   - **Presets**: Style selection widget
   - **Decorations**: Colors, shadows, borders
   - **Layout**: Margins, padding, alignment
   - **Advanced**: Custom classes, IDs, special features

## Available Styling Options

### Basic Styling
- Text alignment
- Font size and weight
- Box size

### Colors & Decoration
- Background color
- Text color
- Shadow depth and color
- Border radius
- Background image

### Layout & Positioning
- Margins and padding (with quad controls)
- Block alignment
- Stretch behavior

### Advanced Features
- Custom CSS classes
- Custom element IDs
- Drop cap styling
- Screen height optimization
- Use as page header
- Hide block
- Clear floats

## Widget Usage

The addon registers these custom widgets:
- `style_align` - Alignment selector with icons
- `style_simple_color` - Color picker with predefined palette
- `quad_size` - Four-sided margin/padding controls
- `slider` - Numeric slider for shadows, borders
- `style_select` - Preset style selector
- `style_text_align` - Text alignment options
- `style_size` - Block size options
- `style_stretch` - Stretch behavior

## CSS Class Generation

Volto's native system automatically generates CSS classes from the styling data:
- `has--backgroundColor--#ff0000` for background colors
- `has--fontSize--large` for font sizes
- Custom CSS variables for advanced styling

## Configuration

The addon automatically applies to all blocks unless configured otherwise:

```javascript
// In your volto.config.js or addon configuration
config.settings.pluggableStylesBlocksWhitelist = ['text', 'image']; // Only these blocks
// OR
config.settings.pluggableStylesBlocksBlacklist = ['html']; // All blocks except these
```