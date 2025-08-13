import json
from plone import api
from plone.restapi.services import Service
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse


@implementer(IPublishTraverse)
class DesignSchemaService(Service):
    """REST API service for managing site design schemas"""

    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def reply(self):
        """Return design schema presets and configurations"""
        
        # This service provides design schema presets that can be used
        # by the frontend color schema widget
        design_presets = [
            {
                'id': 'default',
                'name': 'Default',
                'colors': {
                    'background_color': '#ffffff',
                    'primary_color': '#0070ae',
                    'secondary_color': '#e73d5c',
                    'text_color': '#333333',
                    'accent_color': '#6bb535',
                }
            },
            {
                'id': 'dark',
                'name': 'Dark Mode',
                'colors': {
                    'background_color': '#1a1a1a',
                    'primary_color': '#4a9eff',
                    'secondary_color': '#ff6b9d',
                    'text_color': '#ffffff',
                    'accent_color': '#84d65a',
                }
            },
            {
                'id': 'corporate',
                'name': 'Corporate Blue',
                'colors': {
                    'background_color': '#f8f9fa',
                    'primary_color': '#003d7a',
                    'secondary_color': '#dc3545',
                    'text_color': '#212529',
                    'accent_color': '#28a745',
                }
            },
            {
                'id': 'nature',
                'name': 'Nature Green',
                'colors': {
                    'background_color': '#f1f8e9',
                    'primary_color': '#2e7d32',
                    'secondary_color': '#ff8f00',
                    'text_color': '#1b5e20',
                    'accent_color': '#4caf50',
                }
            }
        ]
        
        return {
            'presets': design_presets,
            'available_fields': [
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
        }