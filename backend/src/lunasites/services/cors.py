from plone import api
from plone.restapi.interfaces import ICORSPolicy
from zope.interface import implementer
from zope.component import adapter
from zope.interface import Interface


@implementer(ICORSPolicy)
@adapter(Interface)
class CustomCORSPolicy:
    """Custom CORS policy that allows specific origins"""
    
    def __init__(self, context):
        self.context = context
    
    @property
    def allow_origin(self):
        """Allow specific origins"""
        return ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.8:3000"]
    
    @property
    def allow_credentials(self):
        return True
    
    @property
    def allow_headers(self):
        return [
            "Accept",
            "Accept-Encoding", 
            "Authorization",
            "Content-Type",
            "Origin",
            "X-Requested-With"
        ]
    
    @property
    def allow_methods(self):
        return ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
    
    @property
    def expose_headers(self):
        return ["Content-Length", "X-My-Header"]
    
    @property
    def max_age(self):
        return 3600