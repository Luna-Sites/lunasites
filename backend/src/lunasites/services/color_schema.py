import json
from plone import api
from plone.restapi.services import Service
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse


@implementer(IPublishTraverse)
class ColorSchemaService(Service):
    """REST API service for managing site color schemas"""

    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        method = self.request.method
        if method == "GET":
            return self._get_color_schema()
        elif method == "POST":
            return self._update_color_schema()
        elif method == "PUT":
            return self._apply_preset()
        else:
            self.request.response.setStatus(405)
            return {"error": "Method not allowed"}

    def _get_color_schema(self):
        """Get current color schema and available presets"""
        try:
            # Get current color schema
            current_schema = api.portal.get_registry_record(
                'lunasites.color_schema', default={}
            )
            
            # Get available presets
            presets_raw = api.portal.get_registry_record(
                'lunasites.color_schema_presets', default=[]
            )
            
            # Parse presets from JSON strings
            presets = []
            for preset_str in presets_raw:
                try:
                    preset = json.loads(preset_str)
                    presets.append(preset)
                except json.JSONDecodeError:
                    continue
            
            return {
                "current_schema": current_schema,
                "presets": presets,
                "suggestions": self._generate_color_suggestions(current_schema)
            }
        except Exception as e:
            self.request.response.setStatus(500)
            return {"error": str(e)}

    def _update_color_schema(self):
        """Update the color schema with new values"""
        try:
            data = json.loads(self.request.get("BODY", "{}"))
            schema_data = data.get("schema", {})
            
            # Validate color values
            valid_colors = {}
            for key, value in schema_data.items():
                if self._is_valid_color(value):
                    valid_colors[key] = value
            
            # Update registry
            api.portal.set_registry_record(
                'lunasites.color_schema', valid_colors
            )
            
            return {
                "success": True,
                "updated_schema": valid_colors,
                "suggestions": self._generate_color_suggestions(valid_colors)
            }
        except Exception as e:
            self.request.response.setStatus(400)
            return {"error": str(e)}

    def _apply_preset(self):
        """Apply a preset color schema"""
        try:
            data = json.loads(self.request.get("BODY", "{}"))
            preset_name = data.get("preset_name")
            
            if not preset_name:
                self.request.response.setStatus(400)
                return {"error": "preset_name is required"}
            
            # Get presets
            presets_raw = api.portal.get_registry_record(
                'lunasites.color_schema_presets', default=[]
            )
            
            # Find matching preset
            preset_schema = None
            for preset_str in presets_raw:
                try:
                    preset = json.loads(preset_str)
                    if preset.get("name") == preset_name:
                        preset_schema = {k: v for k, v in preset.items() if k != "name"}
                        break
                except json.JSONDecodeError:
                    continue
            
            if not preset_schema:
                self.request.response.setStatus(404)
                return {"error": "Preset not found"}
            
            # Apply preset
            api.portal.set_registry_record(
                'lunasites.color_schema', preset_schema
            )
            
            return {
                "success": True,
                "applied_preset": preset_name,
                "schema": preset_schema,
                "suggestions": self._generate_color_suggestions(preset_schema)
            }
        except Exception as e:
            self.request.response.setStatus(400)
            return {"error": str(e)}

    def _is_valid_color(self, color):
        """Validate color format (hex, rgb, rgba, hsl, etc.)"""
        if not color or not isinstance(color, str):
            return False
        
        color = color.strip()
        
        # Hex colors
        if color.startswith('#') and len(color) in [4, 7, 9]:
            try:
                int(color[1:], 16)
                return True
            except ValueError:
                return False
        
        # RGB/RGBA colors
        if color.startswith(('rgb(', 'rgba(')):
            return True
        
        # HSL/HSLA colors
        if color.startswith(('hsl(', 'hsla(')):
            return True
        
        # Gradients
        if 'gradient' in color:
            return True
        
        # Named colors (basic validation)
        named_colors = ['transparent', 'inherit', 'initial', 'unset']
        if color.lower() in named_colors:
            return True
        
        return False

    def _generate_color_suggestions(self, current_schema):
        """Generate color suggestions based on current schema"""
        if not current_schema:
            return []
        
        primary_color = current_schema.get('primary_color', '#0070ae')
        
        # Generate complementary and analogous colors
        suggestions = []
        
        # If we have a hex color, generate variations
        if primary_color.startswith('#') and len(primary_color) == 7:
            try:
                # Parse hex color
                r = int(primary_color[1:3], 16)
                g = int(primary_color[3:5], 16) 
                b = int(primary_color[5:7], 16)
                
                # Generate lighter and darker variations
                suggestions.extend([
                    {
                        "name": "Lighter Primary",
                        "color": self._lighten_color(r, g, b, 0.2),
                        "usage": "Use for backgrounds or hover states"
                    },
                    {
                        "name": "Darker Primary", 
                        "color": self._darken_color(r, g, b, 0.2),
                        "usage": "Use for emphasis or active states"
                    },
                    {
                        "name": "Complementary",
                        "color": self._get_complementary_color(r, g, b),
                        "usage": "Use for accents or call-to-action buttons"
                    }
                ])
            except (ValueError, IndexError):
                pass
        
        return suggestions

    def _lighten_color(self, r, g, b, factor):
        """Lighten a color by mixing with white"""
        r = min(255, int(r + (255 - r) * factor))
        g = min(255, int(g + (255 - g) * factor))
        b = min(255, int(b + (255 - b) * factor))
        return f"#{r:02x}{g:02x}{b:02x}"

    def _darken_color(self, r, g, b, factor):
        """Darken a color by reducing values"""
        r = max(0, int(r * (1 - factor)))
        g = max(0, int(g * (1 - factor)))
        b = max(0, int(b * (1 - factor)))
        return f"#{r:02x}{g:02x}{b:02x}"

    def _get_complementary_color(self, r, g, b):
        """Get complementary color"""
        return f"#{255-r:02x}{255-g:02x}{255-b:02x}"