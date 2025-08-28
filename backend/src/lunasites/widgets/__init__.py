from z3c.form.interfaces import IWidget
from z3c.form.widget import Widget
from zope.component import adapter
from zope.interface import implementer
from zope.schema.interfaces import IDict


@implementer(IWidget)
@adapter(IDict, None)
class ColorSchemaWidget(Widget):
    """Color schema widget for backend forms"""
    
    def __init__(self, field, request):
        super().__init__(request)
        self.field = field
        
    def render(self):
        return '<div class="color-schema-widget">Color Schema Widget</div>'