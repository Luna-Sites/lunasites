# LunaSites Advanced Styling - Direct CSS Styling

## New Approach: Direct Style Injection

This addon now uses Volto's direct CSS styling capabilities instead of CSS classes. Styles are applied directly to the `style` attribute of blocks.

## How It Works

### CSS Custom Properties (`:noprefix`)
The addon uses Volto's `:noprefix` feature to inject CSS properties directly:

```javascript
// Schema definition
'--background-color:noprefix': {
  widget: 'style_simple_color',
  // ...
}
```

Results in:
```html
<div class="block" style="background-color: #ff0000;">
  Block content...
</div>
```

### Direct CSS Properties
Properties are applied directly to the block's style attribute:

- `--text-align:noprefix` → `text-align: center`
- `--font-size:noprefix` → `font-size: large`
- `--background-color:noprefix` → `background-color: #ff0000`
- `--color:noprefix` → `color: #000000`
- `--border-radius:noprefix` → `border-radius: 10px`

### Complex Properties via styleWrapperStyleObjectEnhancer
For complex styling (margins, padding, shadows), we use the style enhancer:

```javascript
// Quad margin widget result
'margin:noprefix': { top: 10, right: 20, bottom: 10, left: 20, unit: 'px' }

// Becomes CSS
margin: '10px 20px 10px 20px'
```

## Available Styling Options

### Basic Styling (Direct CSS)
- **Text Align**: `text-align` property
- **Font Size**: `font-size` property  
- **Font Weight**: `font-weight` property
- **Background Color**: `background-color` property
- **Text Color**: `color` property
- **Height**: `height` property with CSS units

### Enhanced Styling (Processed)
- **Margins**: Converted from quad widget to `margin` shorthand
- **Padding**: Converted from quad widget to `padding` shorthand
- **Background Image**: Includes proper `background-size`, `background-position`
- **Border Radius**: Applied as `border-radius` with px units
- **Box Shadow**: Generated shadow with proper syntax
- **Screen Height**: `min-height: 100vh`
- **Hidden**: `display: none`
- **Clear**: `clear` property

### Legacy Support (CSS Classes)
Some features still use CSS classes for complex effects:
- **Drop Cap**: Uses `::first-letter` pseudo-element
- **Block Alignment**: Full-width, centering effects
- **Size Constraints**: `max-width` constraints

## Expected HTML Output

```html
<div class="block-editor-slate has--align--center has--size--m" 
     style="background-color: #1e8339; color: #6bb535; font-size: large; margin: 10px 20px; padding: 15px; border-radius: 5px;">
  <h2>Styled content with direct CSS</h2>
</div>
```

## Benefits

1. **Performance**: No CSS class lookups, direct styling
2. **Specificity**: Inline styles override any theme CSS
3. **Simplicity**: Styles are immediately visible in DOM
4. **Flexibility**: Supports any CSS value directly
5. **Modern**: Uses Volto's latest styling capabilities

## Technical Implementation

### Schema Fields
Fields use Volto's CSS custom property syntax:
- `--property-name:noprefix` for direct CSS properties
- `property:noprefix` for complex values needing processing

### Style Processing
The `styleWrapperStyleObjectEnhancer` processes complex fields:
- Quad widgets → CSS shorthand properties
- Sliders → Pixel values with units
- Boolean flags → CSS properties or custom variables

### CSS Minimal
Only essential CSS classes remain for effects that cannot be inline:
- Drop cap (uses `::first-letter`)
- Complex layout alignment
- Size constraints

This approach provides maximum styling flexibility while maintaining performance and simplicity.