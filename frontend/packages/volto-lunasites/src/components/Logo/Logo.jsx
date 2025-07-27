// SemanticUI-free pre-@plone/components
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import { UniversalLink } from '@plone/volto/components';
import { toBackendLang } from '@plone/volto/helpers';
import LogoImage from '@plone/volto/components/theme/Logo/Logo.svg';
import { flattenToAppURL } from '@plone/volto/helpers';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';

const messages = defineMessages({
  site: {
    id: 'Site',
    defaultMessage: 'Site',
  },
  homepage: {
    id: 'Back to homepage',
    defaultMessage: 'Back to homepage',
  },
});

const Logo = () => {
  const { settings } = config;
  const lang = useSelector((state) => state.intl.locale);
  const intl = useIntl();
  const site = useSelector((state) => state.site.data);
  const content = useSelector((state) => state.content.data);

  // Get logo data from current content or inherited data
  const [logoText, setLogoText] = React.useState(null);
  const [logoImage, setLogoImage] = React.useState(null);
  const pathname = useSelector((state) => state.router?.location?.pathname);

  React.useEffect(() => {
    const getLogoData = async () => {
      let textOverride = null;
      let imageOverride = null;

      // First check current content
      if (content?.logo_text && content.logo_text.length > 0) {
        textOverride = content.logo_text;
      }
      if (content?.logo_image) {
        imageOverride = content.logo_image;
      }

      // If no overrides on current content, try to get inherited
      if (!textOverride && !imageOverride && pathname) {
        try {
          let cleanedUrl = pathname;

          // Clean the URL from /edit or /add
          if (pathname?.endsWith('/edit')) {
            cleanedUrl = cleanedUrl.slice(0, -'/edit'.length);
          }
          if (pathname?.endsWith('/add')) {
            cleanedUrl = cleanedUrl.slice(0, -'/add'.length);
          }

          // Check if we need to use ++api++
          if (pathname?.includes('/controlpanel')) {
            return;
          }
          console.log(
            `${cleanedUrl}/++api++/${pathname}/@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior`,
          );
          const response = await fetch(
            `${cleanedUrl}/++api++/${pathname}/@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            const inheritedData =
              data['lunasites.behaviors.color_schema.IColorSchemaBehavior']
                ?.data;

            if (
              inheritedData?.logo_text &&
              inheritedData.logo_text.length > 0
            ) {
              textOverride = inheritedData.logo_text;
            }
            if (inheritedData?.logo_image) {
              imageOverride = inheritedData.logo_image;
            }
          }
        } catch (error) {
          console.error('Failed to load inherited logo data:', error);
        }
      }

      setLogoText(textOverride);
      setLogoImage(imageOverride);
    };

    getLogoData();
  }, [content, pathname]);

  // Render logo based on priority: text > image > default
  const renderLogo = () => {
    // Priority 1: Text logo (highest priority)
    if (logoText && logoText.length > 0) {
      const textContent = {
        blocks: {
          'logo-text': {
            '@type': 'slate',
            value: logoText,
            plaintext: '',
          },
        },
        blocks_layout: {
          items: ['logo-text'],
        },
      };

      return (
        <div className="logo-text-content">
          <RenderBlocks content={textContent} />
        </div>
      );
    }

    // Priority 2: Custom image logo
    if (logoImage) {
      return (
        <img
          src={flattenToAppURL(logoImage)}
          alt={intl.formatMessage(messages.homepage)}
          title={intl.formatMessage(messages.homepage)}
        />
      );
    }

    // Priority 3: Default logo (site logo or fallback)
    return (
      <img
        src={
          site['plone.site_logo']
            ? flattenToAppURL(site['plone.site_logo'])
            : LogoImage
        }
        alt={intl.formatMessage(messages.homepage)}
        title={intl.formatMessage(messages.homepage)}
      />
    );
  };

  console.log(logoImage, logoText);
  return (
    <UniversalLink
      href={settings.isMultilingual ? `/${toBackendLang(lang)}` : '/'}
      title={intl.formatMessage(messages.site)}
      className={logoText ? 'logo-link-text' : 'logo-link-image'}
    >
      {renderLogo()}
    </UniversalLink>
  );
};

export default Logo;
