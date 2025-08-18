"""Custom sections service for saving and retrieving section templates."""
from plone import api
from plone.restapi.services import Service
from plone.restapi.deserializer import json_body
from Products.CMFCore.utils import getToolByName
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse
from plone.protect.interfaces import IDisableCSRFProtection
from zope.interface import alsoProvides
import json
import uuid
from datetime import datetime


@implementer(IPublishTraverse)
class CustomSectionsService(Service):
    """Service to handle custom section templates."""

    def __init__(self, context, request):
        super().__init__(context, request)
        self.params = []
        # Disable CSRF protection properly
        alsoProvides(request, IDisableCSRFProtection)

    def publishTraverse(self, request, name):
        self.params.append(name)
        return self

    def get_storage_key(self):
        """Get the registry key for storing custom sections."""
        return "lunasites.custom_sections"

    def get_custom_sections(self):
        """Get all custom sections from registry."""
        try:
            registry = getToolByName(self.context, "portal_registry")
            sections_data = registry.get(self.get_storage_key(), "{}")
            if isinstance(sections_data, str):
                return json.loads(sections_data)
            return sections_data or {}
        except Exception:
            return {}

    def save_custom_sections(self, sections):
        """Save custom sections to registry."""
        registry = getToolByName(self.context, "portal_registry")
        registry[self.get_storage_key()] = json.dumps(sections)

    def reply(self):
        """Handle HTTP requests."""
        method = self.request.method
        
        if method == "GET":
            return self.get_sections()
        elif method == "POST":
            return self.create_section()
        elif method == "DELETE":
            return self.delete_section()
        else:
            self.request.response.setStatus(405)
            return {"error": "Method not allowed"}

    def get_sections(self):
        """Return all custom sections."""
        sections = self.get_custom_sections()
        all_sections = list(sections.values())
        
        # Extract unique categories
        categories = set()
        for section in all_sections:
            category = section.get("category", "General")
            categories.add(category)
        
        return {
            "sections": all_sections,
            "categories": sorted(list(categories)),
            "count": len(sections)
        }

    def create_section(self):
        """Create a new custom section."""
        try:
            data = json_body(self.request)
        except:
            self.request.response.setStatus(400)
            return {"error": "Invalid JSON data"}
        
        # Validate required fields
        if not data.get("name"):
            self.request.response.setStatus(400)
            return {"error": "Name is required"}
        
        if not data.get("data"):
            self.request.response.setStatus(400)
            return {"error": "Section data is required"}

        # Generate unique ID
        section_id = str(uuid.uuid4())
        
        # Create section object
        section = {
            "id": section_id,
            "name": data["name"],
            "description": data.get("description", ""),
            "category": data.get("category", "General"),
            "data": data["data"],
            "created": datetime.now().isoformat(),
            "created_by": api.user.get_current().getId() if api.user.get_current() else "anonymous",
        }

        # Save to registry
        sections = self.get_custom_sections()
        sections[section_id] = section
        self.save_custom_sections(sections)

        self.request.response.setStatus(201)
        return section

    def delete_section(self):
        """Delete a custom section."""
        if not self.params:
            self.request.response.setStatus(400)
            return {"error": "Section ID is required"}
        
        section_id = self.params[0]
        sections = self.get_custom_sections()
        
        if section_id not in sections:
            self.request.response.setStatus(404)
            return {"error": "Section not found"}
        
        del sections[section_id]
        self.save_custom_sections(sections)
        
        return {"message": "Section deleted successfully", "id": section_id}