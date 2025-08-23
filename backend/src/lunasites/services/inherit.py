from plone.restapi.services import Service
from plone.restapi.deserializer import json_body
from plone.restapi.serializer.converters import json_compatible
from plone.behavior.interfaces import IBehavior
from zope.component import getUtility
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse
from zope.security import checkPermission
from lunasites.behaviors.design_schema import IDesignSchema
from plone.namedfile.interfaces import IImageScaleTraversable


@implementer(IPublishTraverse)
class SmartInheritService(Service):
    """Custom inherit service that finds the closest non-null value for each field"""

    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        """Find the closest non-null value for each field in the design schema"""
        
        # Get the behavior name from query parameters
        behavior_names = self.request.form.get("expand.inherit.behaviors", "")
        if not behavior_names:
            return {}
        
        behavior_names = behavior_names.split(",")
        result = {}
        
        for behavior_name in behavior_names:
            if behavior_name == "lunasites.behaviors.design_schema.IDesignSchema":
                inherited_data = self._get_smart_inherit_design_schema()
                if inherited_data:
                    result[behavior_name] = inherited_data
        
        return result

    def _get_smart_inherit_design_schema(self):
        """Get design schema with smart field-by-field inheritance"""
        
        # Define the fields we want to inherit
        fields_to_inherit = [
            'color_schema',
            'navbar_width',
            'container_width',
            'tools_header',
            'logo_image',
            'logo_text',
            'logo_text_bold',
            'hide_login_button',
            'hide_search_button'
        ]
        
        result_data = {}
        inherited_from = {}
        
        # For each field, find the closest ancestor with a non-null value
        for field_name in fields_to_inherit:
            value, source_obj = self._find_closest_field_value(field_name)
            
            if value is not None:
                result_data[field_name] = self._serialize_field_value(value, field_name, source_obj)
                if source_obj:
                    inherited_from[field_name] = {
                        "@id": source_obj.absolute_url(),
                        "title": getattr(source_obj, 'title', '')
                    }
            else:
                # Set appropriate default values for null fields
                result_data[field_name] = self._get_field_default(field_name)
        
        # Special handling for color_schema - check individual colors
        if 'color_schema' in result_data:
            color_result, color_sources = self._get_smart_inherit_colors()
            result_data['color_schema'] = color_result
            if color_sources:
                inherited_from['color_schema_details'] = color_sources

        # Add view_type from current object only (no inheritance)
        if IDesignSchema.providedBy(self.context):
            current_view_type = getattr(self.context, 'view_type', None)
            result_data['view_type'] = self._serialize_field_value(current_view_type, 'view_type', self.context) if current_view_type else None

        return {
            "data": result_data,
            "from": inherited_from.get(list(inherited_from.keys())[0]) if inherited_from else {
                "@id": self.context.absolute_url(),
                "title": getattr(self.context, 'title', '')
            },
            "field_sources": inherited_from  # Show which object each field came from
        }

    def _find_closest_field_value(self, field_name):
        """Find the closest ancestor with a non-null value for the given field"""
        
        for obj in self.context.aq_chain:
            # Check permissions
            if not checkPermission("zope2.View", obj):
                continue
            
            # Check if object provides the behavior
            if not IDesignSchema.providedBy(obj):
                continue
            
            # Get the field value
            value = getattr(obj, field_name, None)
            
            # Check if value is meaningful (not null, empty dict, empty list, etc.)
            if self._is_meaningful_value(value, field_name):
                return value, obj
        
        return None, None

    def _get_smart_inherit_colors(self):
        """Get color schema with individual color inheritance"""
        
        color_fields = [
            'background_color',
            'primary_color',
            'secondary_color', 
            'text_color',
            'accent_color',
            'header_bg_color',
            'header_text_color',
            'toolbar_color',
            'toolbar_font_color',
            'toolbar_border_color',
            'toolbar_border_thickness',
            'dropdown_color',
            'dropdown_font_color'
        ]
        
        result_colors = {}
        color_sources = {}
        
        # For each color, find the closest ancestor with that color defined
        for color_name in color_fields:
            color_value, source_obj = self._find_closest_color_value(color_name)
            
            if color_value is not None:
                result_colors[color_name] = color_value
                if source_obj:
                    color_sources[color_name] = {
                        "@id": source_obj.absolute_url(),
                        "title": getattr(source_obj, 'title', '')
                    }
        
        return result_colors, color_sources

    def _find_closest_color_value(self, color_name):
        """Find the closest ancestor with a specific color defined"""
        
        for obj in self.context.aq_chain:
            # Check permissions
            if not checkPermission("zope2.View", obj):
                continue
            
            # Check if object provides the behavior
            if not IDesignSchema.providedBy(obj):
                continue
            
            # Get the color_schema field
            color_schema = getattr(obj, 'color_schema', {})
            
            # Check if this specific color is defined and not empty
            if color_schema and isinstance(color_schema, dict):
                color_value = color_schema.get(color_name)
                if color_value and color_value.strip():  # Not empty string
                    return color_value, obj
        
        return None, None

    def _is_meaningful_value(self, value, field_name):
        """Check if a value is meaningful (not null, empty, etc.)"""
        
        if value is None:
            return False
        
        # For dictionaries (like color_schema)
        if isinstance(value, dict):
            # Check if dictionary has any non-empty values
            return any(v and str(v).strip() for v in value.values())
        
        # For lists (like tools_header)
        if isinstance(value, list):
            return len(value) > 0
        
        # For strings
        if isinstance(value, str):
            return value.strip() != ""
        
        # For other types, just check if not None
        return value is not None

    def _get_field_default(self, field_name):
        """Get appropriate default value for a field"""
        
        defaults = {
            'color_schema': {},
            'view_type': None,
            'navbar_width': None,
            'container_width': None,
            'tools_header': [],
            'logo_image': None,
            'logo_text': None,
            'logo_text_bold': False,
            'hide_login_button': False,
            'hide_search_button': False
        }
        
        return defaults.get(field_name)

    def _serialize_field_value(self, value, field_name, source_obj):
        """Properly serialize field values, handling special cases like NamedBlobImage"""
        
        # Handle NamedBlobImage objects (like logo_image)
        if hasattr(value, '__class__') and 'NamedBlobImage' in str(value.__class__):
            # Convert to a proper URL structure
            if source_obj and hasattr(value, 'filename'):
                return {
                    "@type": "Image",
                    "filename": getattr(value, 'filename', ''),
                    "content-type": getattr(value, 'contentType', ''),
                    "size": getattr(value, 'size', 0),
                    "download": f"{source_obj.absolute_url()}/@@download/{field_name}",
                    "scales": {}
                }
            return None
        
        # For other values, use the standard json_compatible converter
        try:
            return json_compatible(value)
        except (TypeError, ValueError):
            # If json_compatible fails, return None or a default value
            return None