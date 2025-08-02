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
        fields=['color_schema', 'tools_header'],
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
    
    directives.widget(
        'tools_header',
        frontendOptions={
            'widget': 'tools_header',
        }
    )
    
    tools_header = JSONField(
        title=_('Tools Header Links'),
        description=_('Configure header tools links (Site Map, Contact, etc.). Leave empty to inherit from parent.'),
        schema=OBJECT_LIST,
        default=OBJECT_LIST_DEFAULT_VALUE,
        required=False,
        widget='',
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