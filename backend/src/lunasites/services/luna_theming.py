"""Luna Theming REST API service."""

from plone import api
from plone.registry.interfaces import IRegistry
from plone.restapi.interfaces import IExpandableElement
from plone.restapi.services import Service
from zope.component import adapter, getUtility
from zope.interface import implementer, Interface

from lunasites.interfaces import ILunaThemingRegistry


class LunaThemingGet(Service):
    """GET Luna Theming configuration."""

    def reply(self):
        """Return Luna Theming configuration."""
        registry = getUtility(IRegistry)
        
        # Get Luna Theming data from registry
        theming_data = registry.get('lunasites.luna_theming.luna_theming_config', {})
        
        # Ensure we have default structure
        if not theming_data:
            theming_data = self._get_default_theming()
            
        return {
            'luna_theming': theming_data,
            'source': 'registry'
        }
    
    def _get_default_theming(self):
        """Get default theming configuration."""
        return {
            "colors": {
                "background_color": "#ffffff",
                "neutral_color": "#222222", 
                "primary_color": "#094ce1",
                "secondary_color": "#e73d5c",
                "tertiary_color": "#6bb535",
            },
            "fonts": {
                "primary_font": "Inter",
                "secondary_font": "Helvetica",
                "font_sizes": {
                    "small": "14px",
                    "medium": "16px", 
                    "large": "18px",
                    "xl": "24px",
                    "xxl": "32px"
                }
            },
            "buttons": {
                "border_radius": "6px",
                "padding": "8px 16px",
                "font_weight": "500",
                "transition": "all 0.15s ease"
            }
        }


class LunaThemingPost(Service):
    """POST/PUT Luna Theming configuration."""

    def reply(self):
        """Update Luna Theming configuration."""
        data = self.request.get('BODY', '{}')
        
        if isinstance(data, bytes):
            import json
            data = json.loads(data.decode('utf-8'))
        
        theming_data = data.get('luna_theming', {})
        
        # Validate and sanitize theming data
        theming_data = self._validate_theming_data(theming_data)
        
        # Save to registry
        registry = getUtility(IRegistry)
        registry['lunasites.luna_theming.luna_theming_config'] = theming_data
        
        return {
            'luna_theming': theming_data,
            'status': 'updated',
            'source': 'registry'
        }
    
    def _validate_theming_data(self, data):
        """Validate and sanitize theming data."""
        validated = {}
        
        # Validate colors section
        if 'colors' in data:
            colors = data['colors']
            validated['colors'] = {}
            color_fields = ['background_color', 'neutral_color', 'primary_color', 'secondary_color', 'tertiary_color']
            for field in color_fields:
                if field in colors and self._is_valid_color(colors[field]):
                    validated['colors'][field] = colors[field]
        
        # Validate fonts section
        if 'fonts' in data:
            fonts = data['fonts']
            validated['fonts'] = {}
            if 'primary_font' in fonts:
                validated['fonts']['primary_font'] = fonts['primary_font']
            if 'secondary_font' in fonts:
                validated['fonts']['secondary_font'] = fonts['secondary_font']
            if 'font_sizes' in fonts and isinstance(fonts['font_sizes'], dict):
                validated['fonts']['font_sizes'] = fonts['font_sizes']
        
        # Validate buttons section  
        if 'buttons' in data:
            buttons = data['buttons']
            validated['buttons'] = {}
            button_props = ['border_radius', 'padding', 'font_weight', 'transition']
            for prop in button_props:
                if prop in buttons:
                    validated['buttons'][prop] = buttons[prop]
        
        return validated
    
    def _is_valid_color(self, color):
        """Check if color is valid hex or rgba."""
        if not color:
            return False
        
        # Check hex color
        if color.startswith('#'):
            hex_part = color[1:]
            if len(hex_part) in [3, 6] and all(c in '0123456789ABCDEFabcdef' for c in hex_part):
                return True
        
        # Check rgba color
        if color.startswith('rgba(') and color.endswith(')'):
            return True
            
        return False


@implementer(IExpandableElement)
@adapter(Interface, Interface)
class LunaThemingExpansion:
    """Expandable element for Luna Theming."""

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, expand=False):
        """Return Luna Theming data when expanded."""
        if expand:
            service = LunaThemingGet(self.context, self.request)
            return service.reply()
        return {
            'luna_theming': {
                '@id': f"{self.context.absolute_url()}/@luna-theming"
            }
        }