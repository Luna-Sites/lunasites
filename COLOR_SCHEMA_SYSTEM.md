# Color Schema System

A comprehensive color management system for Luna Sites that provides Squarespace-like color theming capabilities.

## Overview

The Color Schema System allows users to define and manage a consistent color palette across their entire website. It includes:

- **Global Color Variables**: Six core colors (background, primary, secondary, header, text, accent)
- **Preset Management**: Pre-configured color combinations
- **Smart Suggestions**: AI-powered color recommendations
- **Widget Integration**: Seamless integration with existing color widgets
- **CSS Variables**: Automatic CSS custom property injection
- **REST API**: Backend API for color schema management

## Components

### Backend Components

#### 1. Registry Configuration (`backend/src/lunasites/profiles/default/registry/main.xml`)
- **lunasites.color_schema**: Stores the current color schema
- **lunasites.color_schema_presets**: Stores predefined color combinations

#### 2. REST API Service (`backend/src/lunasites/services/color_schema.py`)
- **GET /@color-schema**: Retrieve current schema, presets, and suggestions
- **POST /@color-schema**: Update color schema
- **PUT /@color-schema**: Apply a preset color schema

#### 3. Control Panel (`backend/src/lunasites/controlpanel/color_schema.py`)
- Admin interface for managing color schemas
- Integrated with Plone's control panel system

### Frontend Components

#### 1. Color Schema Widget (`frontend/packages/lunasites-advanced-styling/src/Widgets/ColorSchemaWidget.jsx`)
- Main interface for color schema management
- Preset selection and preview
- Individual color customization
- Smart color suggestions
- Real-time preview

#### 2. Enhanced Simple Color Picker (`frontend/packages/lunasites-advanced-styling/src/Widgets/SimpleColorPicker.jsx`)
- Integration with color schema colors
- Quick access to schema colors
- Maintains existing functionality

#### 3. CSS Variables System (`frontend/packages/volto-lunasites/src/theme/custom/_color-schema.scss`)
- CSS custom properties for all colors
- Utility classes for applying colors
- Integration with common UI elements
- Responsive design support

## Usage

### For Developers

#### Using CSS Variables in Your Components

```scss
.my-component {
  background-color: var(--lunasites-background-color);
  color: var(--lunasites-text-color);
  border: 1px solid var(--lunasites-primary-color);
}

// Use utility classes
.my-element {
  @extend .color-schema-primary-bg;
  @extend .color-schema-transition;
}
```

#### Available CSS Variables

- `--lunasites-background-color`: Main background color
- `--lunasites-primary-color`: Primary brand color
- `--lunasites-secondary-color`: Secondary accent color
- `--lunasites-header-color`: Header/navigation color
- `--lunasites-text-color`: Main text color
- `--lunasites-accent-color`: Additional accent color
- `--lunasites-primary-light`: Auto-generated lighter primary
- `--lunasites-primary-dark`: Auto-generated darker primary

#### Utility Classes

- `.color-schema-bg`: Apply background color
- `.color-schema-primary`: Apply primary text color
- `.color-schema-primary-bg`: Apply primary background
- `.color-schema-secondary`: Apply secondary text color
- `.color-schema-secondary-bg`: Apply secondary background
- `.color-schema-header`: Apply header text color
- `.color-schema-header-bg`: Apply header background
- `.color-schema-text`: Apply text color
- `.color-schema-accent`: Apply accent text color
- `.color-schema-accent-bg`: Apply accent background
- `.color-schema-transition`: Add smooth color transitions

### For Content Editors

#### Using the Color Schema Widget

1. **Access the Widget**: Available in block styling panels
2. **Choose Presets**: Select from predefined color combinations
3. **Customize Colors**: Adjust individual colors using color pickers
4. **View Suggestions**: Get AI-powered color recommendations
5. **Apply Changes**: Colors are applied immediately across the site

#### Available Presets

- **Modern Blue**: Professional blue-based palette
- **Elegant Dark**: Dark theme with bright accents
- **Warm Sunset**: Warm orange/yellow tones
- **Cool Mint**: Fresh green/teal palette
- **Professional Gray**: Neutral gray-based scheme

### REST API Usage

#### Get Current Color Schema
```bash
GET /@color-schema
```

Response:
```json
{
  "current_schema": {
    "background_color": "#ffffff",
    "primary_color": "#0070ae",
    "secondary_color": "#e73d5c",
    "header_color": "#2c3e50",
    "text_color": "#333333",
    "accent_color": "#6bb535"
  },
  "presets": [...],
  "suggestions": [...]
}
```

#### Update Color Schema
```bash
POST /@color-schema
Content-Type: application/json

{
  "schema": {
    "primary_color": "#ff0000",
    "secondary_color": "#00ff00"
  }
}
```

#### Apply Preset
```bash
PUT /@color-schema
Content-Type: application/json

{
  "preset_name": "Modern Blue"
}
```

## Integration with Existing Systems

### Block Integration

The color schema automatically integrates with:
- Volto blocks through CSS variables
- Advanced styling widgets
- Theme components
- Navigation elements
- Form controls

### Widget Integration

- **SimpleColorPicker**: Shows color schema colors as quick options
- **ColorSchemaWidget**: Main management interface
- **Style widgets**: Inherit color schema values

### Theme Integration

The system automatically applies colors to:
- Body background and text
- Navigation menus
- Buttons and links
- Form elements
- Cards and content blocks

## Smart Color Suggestions

The system provides intelligent color suggestions based on:
- Current primary color analysis
- Complementary color theory
- Lighter/darker variations
- Accessibility considerations

Suggestions include:
- **Usage recommendations**: Where to apply each color
- **Color relationships**: How colors work together
- **Accessibility notes**: Contrast and readability information

## Customization and Extension

### Adding New Presets

1. Update `backend/src/lunasites/profiles/default/registry/main.xml`
2. Add new preset JSON to `lunasites.color_schema_presets`
3. Restart the backend

### Creating Custom Color Fields

Add new color fields to the schema:
1. Update registry configuration
2. Modify the ColorSchemaWidget component
3. Add corresponding CSS variables

### Extending Color Suggestions

Modify `_generate_color_suggestions()` in `color_schema.py` to add:
- New color algorithms
- Accessibility checks
- Brand color validation
- Custom recommendation logic

## Best Practices

### For Developers

1. **Always use CSS variables** instead of hardcoded colors
2. **Include fallback values** for older browsers
3. **Test color combinations** for accessibility
4. **Use utility classes** for common patterns
5. **Implement smooth transitions** for color changes

### For Designers

1. **Start with presets** before customizing
2. **Maintain contrast ratios** for accessibility
3. **Test on different devices** and screen sizes
4. **Consider brand guidelines** when selecting colors
5. **Use suggestions** for color harmony

### For Content Editors

1. **Preview changes** before applying
2. **Test readability** with different text sizes
3. **Consider user experience** across the site
4. **Use presets** for quick professional looks
5. **Save custom combinations** for reuse

## Troubleshooting

### Colors Not Applying

1. Check browser developer tools for CSS variable values
2. Verify backend API responses
3. Clear browser cache
4. Restart Volto development server

### Performance Issues

1. Limit frequent color changes
2. Use CSS transitions sparingly
3. Optimize color calculation algorithms
4. Consider caching color suggestions

### Accessibility Concerns

1. Test contrast ratios with tools like WebAIM
2. Verify color-blind accessibility
3. Ensure sufficient text contrast
4. Test with screen readers

## Future Enhancements

- **Color palette import/export**
- **Advanced color theory integration**
- **Accessibility compliance checking**
- **Brand color validation**
- **Color history and versioning**
- **A/B testing integration**
- **Color performance analytics**