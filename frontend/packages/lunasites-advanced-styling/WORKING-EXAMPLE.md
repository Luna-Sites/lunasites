# LunaSites Advanced Styling - Working Example

## Fixed CSS Properties

After removing the `--` prefix, the styling now works correctly with direct CSS properties.

## Schema Properties → CSS Output

### Basic Styling
```javascript
// Schema field names
'textAlign:noprefix'      → style="text-align: center"
'fontSize:noprefix'       → style="font-size: large"
'fontWeight:noprefix'     → style="font-weight: 600"
'backgroundColor:noprefix' → style="background-color: #1e8339"
'color:noprefix'          → style="color: #6bb535"
```

### Advanced Styling
```javascript
// Processed by styleWrapperStyleObjectEnhancer
'borderRadius:noprefix' → style="border-radius: 10px"
'boxShadow:noprefix'    → style="box-shadow: 0 0 5px rgba(0, 0, 0, 0.3)"
'backgroundImage:noprefix' → style="background-image: url(...); background-size: cover"
```

### Layout (Quad Widgets)
```javascript
// Margin quad widget: {top: 10, right: 20, bottom: 10, left: 20, unit: 'px'}
'margin:noprefix' → style="margin: 10px 20px 10px 20px"

// Padding quad widget: {top: 15, right: 15, bottom: 15, left: 15, unit: 'px'}
'padding:noprefix' → style="padding: 15px 15px 15px 15px"
```

## Expected HTML Output

When you select styling options, you should see:

```html
<div class="block-editor-slate has--align--center has--size--m" 
     style="text-align: center; font-size: large; font-weight: 600; 
            background-color: #1e8339; color: #6bb535; 
            border-radius: 10px; margin: 10px 20px; padding: 15px;">
  <h2>This content is now properly styled!</h2>
</div>
```

## How to Test

1. **Select any block** in Volto editor
2. **Open sidebar** → Styling section  
3. **Change any styling option**:
   - Text Align → should see `text-align: center` in style attribute
   - Font Size → should see `font-size: large` in style attribute
   - Background Color → should see `background-color: #color` in style attribute
   - Border Radius → should see `border-radius: Npx` in style attribute

## Debugging

1. **Inspect the block element** in browser dev tools
2. **Check the `style` attribute** - should contain the CSS properties
3. **Verify styling applies visually** - colors, sizes, alignment should change

If styles don't appear in the `style` attribute, check:
- Field names in schema match the `:noprefix` format
- styleWrapperStyleObjectEnhancer is processing the values correctly
- No console errors in browser

## Key Differences from Before

❌ **Old (broken):**
```javascript
'--background-color:noprefix' // CSS custom property - doesn't work directly
```

✅ **New (working):**
```javascript  
'backgroundColor:noprefix'    // Direct CSS property - works immediately
```

The `:noprefix` suffix tells Volto to apply the value directly as a CSS property without any prefixing or class generation.