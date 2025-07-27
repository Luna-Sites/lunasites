from plone.autoform import directives
from plone.autoform.interfaces import IFormFieldProvider
from plone.dexterity.interfaces import IDexterityContent
from plone.supermodel import model
from zope import schema
from zope.component import adapter
from zope.interface import implementer, provider
from eea.schema.slate.field import SlateJSONField

from lunasites import _


@provider(IFormFieldProvider)
class IColorSchemaBehavior(model.Schema):
    """Behavior for adding color schema to content objects"""

    model.fieldset(
        'color_schema',
        label=_('Color Schema'),
        fields=['color_schema'],
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
    
    directives.widget(
        'logo_image',
        frontendOptions={
            'widget': 'object_browser',
            'pattern_options': {
                'selectableTypes': ['Image'],
                'maximumSelectionSize': 1,
            }
        }
    )
    
    logo_image = schema.TextLine(
        title=_('Logo Image'),
        description=_('Upload or select custom logo image. Leave empty to use default logo.'),
        required=False,
    )
    
    logo_text = SlateJSONField(
        title=_('Logo Text'),
        description=_('Custom text logo with rich formatting. If filled, this will override logo image.'),
        required=False,
    )


@implementer(IColorSchemaBehavior)
@adapter(IDexterityContent)
class ColorSchemaBehavior:
    """Adapter for color schema behavior"""

    def __init__(self, context):
        self.context = context

    @property
    def color_schema(self):
        return getattr(self.context, 'color_schema', {})

    @color_schema.setter
    def color_schema(self, value):
        self.context.color_schema = value or {}