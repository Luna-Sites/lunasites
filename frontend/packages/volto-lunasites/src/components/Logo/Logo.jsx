// SemanticUI-free pre-@plone/components
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import { UniversalLink } from '@plone/volto/components';
import { toBackendLang } from '@plone/volto/helpers';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import LogoImage from '@plone/volto/components/theme/Logo/Logo.svg';
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
  // Get logo data from Redux store (DesignSchemaProvider handles the loading)
  const designSchemaData = useSelector(
    (state) =>
      state?.designSchema?.data?.[
        'lunasites.behaviors.design_schema.IDesignSchema'
      ]?.data,
  );

  // Extract logo data from design schema
  const logoText = designSchemaData?.logo_text || null;
  const logoImage = designSchemaData?.logo_image || null;

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
