"""Luna Theming behavior for extensible site styling."""

from plone.autoform import directives
from plone.autoform.interfaces import IFormFieldProvider
from plone.behavior import annotation
from plone.schema import JSONField
from plone.supermodel import model
from zope import schema
from zope.interface import provider

from lunasites import _


@provider(IFormFieldProvider)
class ILunaTheming(model.Schema):
    """Luna Theming behavior for extensible site styling."""

    model.fieldset(
        "luna_theming",
        label=_("Luna Theming"),
        fields=["luna_theming_data"],
    )

    directives.widget(
        "luna_theming_data",
        frontendOptions={
            "widget": "luna_theming_widget",
        },
    )

    luna_theming_data = JSONField(
        title=_("Luna Theming Configuration"),
        description=_(
            "Extensible theming configuration including colors, fonts, buttons and more."
        ),
        required=False,
        default={
            "colors": {
                "background_color": "#ffffff",
                "neutral_color": "#222222", 
                "primary_color": "#094ce1",
                "secondary_color": "#e73d5c",
                "tertiary_color": "#6bb535",
            },
            "fonts": {
                "primary_font": "Inter",
                "secondary_font": "Helvetica",
                "font_sizes": {
                    "small": "14px",
                    "medium": "16px", 
                    "large": "18px",
                    "xl": "24px",
                    "xxl": "32px"
                }
            },
            "buttons": {
                "border_radius": "6px",
                "padding": "8px 16px",
                "font_weight": "500",
                "transition": "all 0.15s ease"
            }
        },
        missing_value={},
    )


@annotation.factory
class LunaThemingAnnotation:
    """Luna Theming annotation storage."""