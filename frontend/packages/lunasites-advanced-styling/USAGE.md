# LunaSites Advanced Styling - Usage Guide

## How to Use

1. **Select any block** in the Volto editor
2. **Open the sidebar** (should open automatically when block is selected)
3. **Scroll to the "Styling" section** - all advanced styling options are now organized vertically

## Available Styling Options (Vertical Layout)

### Presets
- **Style Name**: Select from predefined styles

### Basic Styling
- **Text Align**: Left, center, right, justify
- **Font Size**: xx-small to xxx-large
- **Font Weight**: Light (300) to Bold (700)
- **Align**: Block alignment (left, center, right, full)
- **Stretch**: Make block stretch to full width
- **Size**: Block size (small, medium, large)

### Colors & Decorations
- **Background Color**: Color picker with predefined palette
- **Text Color**: Color picker for text
- **Background Image**: URL input for background images
- **Border Radius**: Slider (0-24px) for rounded corners
- **Shadow Depth**: Slider (0-24px) for drop shadows
- **Shadow Color**: Color picker for shadow

### Layout
- **Margin**: Quad controls for top/right/bottom/left margins
- **Padding**: Quad controls for top/right/bottom/left padding

### Advanced
- **Theme**: Theme color selection
- **Height**: Custom height (CSS units: px, em, %, vh, etc.)
- **Screen Height**: Make block full viewport height
- **Drop Cap**: Style first letter as drop cap
- **Use as Page Header**: Use block as page header
- **Hidden**: Hide the block
- **Custom Class**: Add custom CSS classes
- **Custom ID**: Add custom HTML ID
- **Clear**: Clear floated elements (left, right, both)

## Technical Details

### CSS Classes Generated
Volto automatically generates CSS classes like:
- `has--backgroundColor--#ff0000`
- `has--fontSize--large`
- `has--textAlign--center`

### CSS Custom Properties
Advanced styling uses CSS custom properties:
- `--background-color`, `--text-color`
- `--margin-top`, `--padding-left`, etc.
- `--borderRadius`, `--shadowDepth`

### Example HTML Output
```html
<div class="block has--backgroundColor--#ff0000 has--fontSize--large" 
     style="--background-color: #ff0000; --margin-top: 20px; --padding-left: 15px;">
  Block content...
</div>
```

## Tips

1. **Colors**: Use the color picker to ensure consistent branding
2. **Spacing**: Use margin for space around blocks, padding for space inside
3. **Units**: Margins and padding support px, %, em, rem units
4. **Performance**: CSS custom properties are efficient and modern
5. **Responsive**: Styles adapt automatically to different screen sizes

## Troubleshooting

If styles don't appear:
1. Check browser developer tools for generated classes and CSS variables
2. Ensure the CSS is loading (check Network tab)
3. Try refreshing the page after making changes
4. Check for CSS conflicts with existing theme styles