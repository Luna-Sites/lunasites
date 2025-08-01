// SemanticUI-free pre-@plone/components
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import { UniversalLink } from '@plone/volto/components';
import { toBackendLang } from '@plone/volto/helpers';
import LogoImage from '@plone/volto/components/theme/Logo/Logo.svg';
import { flattenToAppURL } from '@plone/volto/helpers';
import { serializeNodesToText } from '@plone/volto-slate/editor/render';
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

  const isUrlExcluded = (url) => {
    const { nonContentRoutes = [], addonRoutes = [] } = config.settings;
    const matchesNonContent = nonContentRoutes.some((route) =>
      route instanceof RegExp ? route.test(url) : false,
    );
    const matchesAddon = addonRoutes.some((route) =>
      typeof route.path === 'string' ? url.startsWith(route.path) : false,
    );

    return matchesNonContent || matchesAddon;
  };

  // Get logo data from current content or inherited data
  const [logoText, setLogoText] = React.useState(null);
  const [logoImage, setLogoImage] = React.useState(null);
  const pathname = useSelector((state) => state.router?.location?.pathname);
  const location = useSelector((state) => state.router?.location);
  React.useEffect(() => {
    const getLogoData = async () => {
      let textOverride = null;
      let imageOverride = null;

      // If no overrides on current content, try to get inherited
      if (!textOverride && !imageOverride && pathname) {
        try {
          let cleanedUrl = pathname;

          // First clean the URL from /edit or /add
          if (pathname?.endsWith('/edit')) {
            cleanedUrl = cleanedUrl.slice(0, -'/edit'.length);
          }
          if (pathname?.endsWith('/add')) {
            cleanedUrl = cleanedUrl.slice(0, -'/add'.length);
          }
          // Then check if we need to use ++api++

          cleanedUrl = window.location.origin + '/++api++' + cleanedUrl;
          console.log('wow', cleanedUrl);
          const response = await fetch(
            `${cleanedUrl}/@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            },
          );
          console.log(
            'jj',
            `${cleanedUrl}/@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior`,
          );
          if (response.ok) {
            const data = await response.json();
            console.log(
              'jj',
              { data },
              `${cleanedUrl}/@inherit?expand.inherit.behaviors=lunasites.behaviors.color_schema.IColorSchemaBehavior`,
            );
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
      console.log('ss', textOverride);
      setLogoText(textOverride);
      setLogoImage(imageOverride);
    };

    getLogoData();
  }, [content, pathname]);

  // Render logo based on priority: text > image > default
  const renderLogo = () => {
    // Priority 1: Text logo (highest priority)
    if (logoText && logoText.length > 0) {
      const serializedText = serializeNodesToText(logoText);

      // If serializeText returns empty string, skip to image
      if (serializedText && serializedText.trim() !== '') {
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
    }

    // Priority 2: Custom image logo
    if (logoImage) {
      // Handle NamedBlobImage object structure
      const imageSrc =
        typeof logoImage === 'string'
          ? logoImage
          : logoImage.download || logoImage['@id'] || logoImage;

      return (
        <img
          src={flattenToAppURL(imageSrc)}
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
