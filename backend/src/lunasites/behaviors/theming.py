from plone.autoform.interfaces import IFormFieldProvider
from plone.autoform import directives
from plone.supermodel import model
from zope import schema
from zope.interface import provider


@provider(IFormFieldProvider)
class ISiteTheming(model.Schema):
    """Behavior for site-wide theming configuration"""
    
    model.fieldset(
        'theming',
        label=u'Theming',
        description=u'Configure site-wide appearance and theming',
        fields=['color_schema', 'header_variation']
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