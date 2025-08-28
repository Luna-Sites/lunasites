from Products.CMFPlone.interfaces import INonInstallable
from zope.interface import implementer
from plone import api
from plone.dexterity.interfaces import IDexterityFTI
from zope.component import getUtility


@implementer(INonInstallable)
class HiddenProfiles:
    def getNonInstallableProfiles(self):
        """Hide uninstall profile from site-creation and quickinstaller."""
        return [
            "lunasites:uninstall",
        ]




def uninstall(context):
    """Uninstall script"""
    pass