from zope.interface import implementer
from zope.component import adapter
from zope.interface import Interface
from zope.publisher.interfaces.http import IHTTPRequest
from plone.restapi.services import Service


@adapter(Interface, IHTTPRequest)
class CORSMixin:
    """CORS mixin to add headers to responses"""
    
    def __init__(self, context, request):
        self.context = context
        self.request = request
    
    def add_cors_headers(self):
        """Add CORS headers to response"""
        origin = self.request.getHeader('Origin', '')
        allowed_origins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000', 
            'http://192.168.1.8:3000'
        ]
        
        if origin in allowed_origins:
            self.request.response.setHeader('Access-Control-Allow-Origin', origin)
        
        self.request.response.setHeader('Access-Control-Allow-Credentials', 'true')
        self.request.response.setHeader(
            'Access-Control-Allow-Headers',
            'Accept,Accept-Encoding,Authorization,Content-Type,Origin,X-Requested-With'
        )
        self.request.response.setHeader(
            'Access-Control-Allow-Methods',
            'DELETE,GET,OPTIONS,PATCH,POST,PUT'
        )
        self.request.response.setHeader(
            'Access-Control-Expose-Headers',
            'Content-Length,X-My-Header'
        )
        self.request.response.setHeader('Access-Control-Max-Age', '3600')