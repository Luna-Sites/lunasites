from plone.autoform.interfaces import IFormFieldProvider
from plone.autoform import directives
from plone.supermodel import model
from zope import schema
from zope.interface import provider
from eea.schema.slate.field import SlateJSONField
from plone.schema import JSONField


@provider(IFormFieldProvider)
class ISiteTheming(model.Schema):
    """Behavior for site-wide theming configuration"""
    
    model.fieldset(
        'theming',
        label=u'Theming',
        description=u'Configure site-wide appearance and theming',
        fields=['color_schema', 'header_variation', 'logo_config', 'container_width']
    )
    
    directives.widget(
        'color_schema',
        frontendOptions={
            'widget': 'color_schema'
        }
    )
    
    color_schema = schema.Dict(
        title=u"Color Theme",
        description=u"Configure site-wide color theme and appearance",
        key_type=schema.ASCIILine(title=u"Key"),
        value_type=schema.TextLine(title=u"Value"),
        required=False,
        default={}
    )
    
    directives.widget(
        'header_variation',
        frontendOptions={
            'widget': 'header_variation'
        }
    )
    
    header_variation = schema.TextLine(
        title=u"Header Style",
        description=u"Choose header color variation",
        required=False,
        default=u'primary_navigation'
    )
    
    directives.widget(
        'logo_config',
        frontendOptions={
            'widget': 'logo_config'
        }
    )
    
    logo_config = JSONField(
        title=u"Logo Configuration",
        description=u"Configure site logo image, text and layout options",
        required=False,
        default={}
    )
    
    directives.widget(
        'container_width',
        frontendOptions={
            'widget': 'container_width'
        }
    )
    
    container_width = schema.Choice(
        title=u"Container Width",
        description=u"Choose container width for content layout",
        values=['narrow', 'normal', 'wide', 'full'],
        default='normal',
        required=False,
    )