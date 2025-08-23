from plone.autoform import directives
from plone.autoform.interfaces import IFormFieldProvider
from plone.dexterity.interfaces import IDexterityContent
from plone.supermodel import model
from zope import schema
from plone.schema import JSONField
import json
from zope.component import adapter
from zope.interface import implementer, provider
from plone.namedfile.field import NamedBlobImage
from eea.schema.slate.field import SlateJSONField

from lunasites import _


OBJECT_LIST_DEFAULT_VALUE = []

OBJECT_LIST = json.dumps({
    "type": "array",
    "items": {
        "type": "object",
    },
})


@provider(IFormFieldProvider)
class IDesignSchema(model.Schema):
    """Behavior for adding design schema to content objects"""

    model.fieldset(
        'design_schema',
        label=_('Design Schema'),
        fields=['color_schema', 'view_type', 'navbar_width', 'container_width', 'tools_header', 'hide_login_button', 'hide_search_button', 'logo_image', 'logo_text', 'logo_text_bold'],
    )
    

    directives.widget(
        'color_schema',
        frontendOptions={
            'widget': 'color_schema',
        }
    )
    
    directives.order_before(color_schema='*')
    
    color_schema = schema.Dict(
        title=_('Color Schema'),
        description=_('Color schema for this page. Leave empty to inherit from parent.'),
        key_type=schema.ASCIILine(),
        value_type=schema.TextLine(),
        required=False,
        missing_value={},
        default={},
    )
    
    logo_image = NamedBlobImage(
        title=_('Logo Image'),
        description=_('Upload or select custom logo image. Leave empty to use default logo.'),
        required=False,
    )
    
    logo_text = SlateJSONField(
        title=_('Logo Text'),
        description=_('Custom text logo with rich formatting. If filled, this will override logo image.'),
        required=False,
    )
    
    logo_text_bold = schema.Bool(
        title=_('Bold Logo Text'),
        description=_('Make the logo text bold'),
        required=False,
        default=False,
    )
    
    directives.widget(
        'tools_header',
        frontendOptions={
            'widget': 'tools_header',
        }
    )
    
    view_type = schema.Choice(
        title=_('View Type'),
        description=_('Choose the view layout type for this page. Leave empty to inherit from parent.'),
        vocabulary=schema.vocabulary.SimpleVocabulary([
            schema.vocabulary.SimpleTerm('default', 'default', _('Default')),
            schema.vocabulary.SimpleTerm('homepage', 'homepage', _('Homepage')),
            schema.vocabulary.SimpleTerm('homepage-inverse', 'homepage-inverse', _('Homepage Inverse')),
        ]),
        required=False,
    )
    
    navbar_width = schema.TextLine(
        title=_('Navbar Width'),
        description=_('Width value (e.g., 1200px, 100%, 90vw). Leave empty to inherit from parent.'),
        required=False,
    )
    
    container_width = schema.TextLine(
        title=_('Container Width'),
        description=_('Width value (e.g., 1000px, 90%, 80vw). Leave empty to inherit from parent.'),
        required=False,
    )
    
    tools_header = JSONField(
        title=_('Tools Header Links'),
        description=_('Configure header tools links (Site Map, Contact, etc.). Leave empty to inherit from parent.'),
        schema=OBJECT_LIST,
        default=OBJECT_LIST_DEFAULT_VALUE,
        required=False,
        widget='',
    )
    
    hide_login_button = schema.Bool(
        title=_('Hide Login Button'),
        description=_('Hide the login button from the header. Leave unchecked to inherit from parent.'),
        required=False,
        default=False,
    )
    
    hide_search_button = schema.Bool(
        title=_('Hide Search Button'),
        description=_('Hide the search button from the header. Leave unchecked to inherit from parent.'),
        required=False,
        default=False,
    )
    


@implementer(IDesignSchema)
@adapter(IDexterityContent)
class DesignSchemaBehavior:
    """Adapter for design schema behavior"""

    def __init__(self, context):
        self.context = context

    @property
    def color_schema(self):
        return getattr(self.context, 'color_schema', {})

    @color_schema.setter
    def color_schema(self, value):
        self.context.color_schema = value or {}
    
    @property
    def tools_header(self):
        return getattr(self.context, 'tools_header', [])

    @tools_header.setter
    def tools_header(self, value):
        self.context.tools_header = value or []
    
    @property
    def navbar_width(self):
        return getattr(self.context, 'navbar_width', None)

    @navbar_width.setter
    def navbar_width(self, value):
        self.context.navbar_width = value

    @property
    def container_width(self):
        return getattr(self.context, 'container_width', None)

    @container_width.setter
    def container_width(self, value):
        self.context.container_width = value
    
    @property
    def view_type(self):
        return getattr(self.context, 'view_type', None)

    @view_type.setter
    def view_type(self, value):
        self.context.view_type = value
    
    @property
    def hide_login_button(self):
        return getattr(self.context, 'hide_login_button', False)

    @hide_login_button.setter
    def hide_login_button(self, value):
        self.context.hide_login_button = value
    
    @property
    def hide_search_button(self):
        return getattr(self.context, 'hide_search_button', False)

    @hide_search_button.setter
    def hide_search_button(self, value):
        self.context.hide_search_button = value
    
    @property
    def logo_text_bold(self):
        return getattr(self.context, 'logo_text_bold', False)

    @logo_text_bold.setter
    def logo_text_bold(self, value):
        self.context.logo_text_bold = value
    
    def get_width_type(self, width_value):
        """Auto-detect width type based on value format"""
        if not width_value:
            return None
        
        width_str = str(width_value).strip().lower()
        
        # Check for relative units
        if any(unit in width_str for unit in ['%', 'vw', 'vh', 'vmin', 'vmax', 'em', 'rem']):
            return 'relative'
        
        # Check for fixed units (px, pt, cm, mm, in, etc.)
        if any(unit in width_str for unit in ['px', 'pt', 'cm', 'mm', 'in', 'pc']):
            return 'fixed'
        
        # If no unit specified, assume pixels (fixed)
        if width_str.replace('.', '').isdigit():
            return 'fixed'
        
        # Default to relative for unrecognized formats
        return 'relative'
    
    def get_navbar_width_type(self):
        """Get navbar width type based on value"""
        return self.get_width_type(self.navbar_width)
    
    def get_container_width_type(self):
        """Get container width type based on value"""
        return self.get_width_type(self.container_width)