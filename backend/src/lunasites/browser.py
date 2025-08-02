from zope.publisher.browser import BrowserView
from zope.interface import implementer
from zope.publisher.interfaces import IPublishTraverse


@implementer(IPublishTraverse)
class CORSOptionsView(BrowserView):
    """Handle CORS preflight requests"""
    
    def publishTraverse(self, request, name):
        return self
    
    def __call__(self):
        """Handle OPTIONS request for CORS"""
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
        self.request.response.setHeader('Access-Control-Max-Age', '3600')
        self.request.response.setStatus(200)
        
        return ""