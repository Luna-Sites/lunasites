"""Luna Theming Control Panel."""

from plone.app.registry.browser.controlpanel import ControlPanelFormWrapper
from plone.app.registry.browser.controlpanel import RegistryEditForm
from plone.z3cform import layout
from zope import schema
from zope.interface import Interface

from lunasites import _
from lunasites.interfaces import ILunaThemingRegistry


class ILunaThemingControlPanel(ILunaThemingRegistry):
    """Luna Theming control panel interface."""
    pass


class LunaThemingControlPanelForm(RegistryEditForm):
    """Luna Theming control panel form."""

    schema = ILunaThemingControlPanel
    schema_prefix = "lunasites.luna_theming"
    label = _("Luna Theming")
    description = _(
        "Configure global theming settings including colors, fonts, buttons and more."
    )


LunaThemingControlPanelView = layout.wrap_form(
    LunaThemingControlPanelForm, ControlPanelFormWrapper
)