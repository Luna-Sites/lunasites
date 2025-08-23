// SemanticUI-free pre-@plone/components
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import { UniversalLink } from '@plone/volto/components';
import { toBackendLang } from '@plone/volto/helpers';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import { serializeNodesToText } from '@plone/volto-slate/editor/render';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import './Logo.css';

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
  const logoTextBold = designSchemaData?.logo_text_bold || false;
  
  // Debug: să vedem ce valoare primim
  console.log('Logo text bold value:', logoTextBold, 'Type:', typeof logoTextBold);
  console.log('Full design schema data:', designSchemaData);

  // Render logo based on availability: both > image only > text only > default
  const renderLogo = () => {
    const hasText =
      logoText &&
      logoText.length > 0 &&
      serializeNodesToText(logoText)?.trim() !== '';
    const hasImage = logoImage;

    // Case 1: Both image and text available - show both (image first, then text)
    if (hasImage && hasText) {
      const imageSrc =
        typeof logoImage === 'string'
          ? logoImage
          : logoImage.download || logoImage['@id'] || logoImage;

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
        <div
          className="logo-combined"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            maxWidth: 'fit-content',
          }}
        >
          <img
            src={flattenToAppURL(imageSrc)}
            alt={intl.formatMessage(messages.homepage)}
            title={intl.formatMessage(messages.homepage)}
            className="logo-image"
            style={{ flexShrink: 0 }}
          />
          <div 
            className={`logo-text-content ${logoTextBold ? 'logo-text-bold' : ''}`}
            style={{ 
              flexShrink: 0
            }}
          >
            <RenderBlocks content={textContent} />
          </div>
        </div>
      );
    }

    // Case 2: Only custom image logo
    if (hasImage) {
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

    // Case 3: Only text logo
    if (hasText) {
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
        <div 
          className={`logo-text-content ${logoTextBold ? 'logo-text-bold' : ''}`}
        >
          <RenderBlocks content={textContent} />
        </div>
      );
    }

    // Case 4: No logo - return null (don't render anything)
    return null;
  };

  // Determine the CSS class based on logo content
  const getLogoLinkClass = () => {
    const hasText =
      logoText &&
      logoText.length > 0 &&
      serializeNodesToText(logoText)?.trim() !== '';
    const hasImage = logoImage;

    if (hasImage && hasText) {
      return 'logo-link-combined';
    }
    if (hasText) {
      return 'logo-link-text';
    }
    return 'logo-link-image';
  };

  return (
    <UniversalLink
      href={settings.isMultilingual ? `/${toBackendLang(lang)}` : '/'}
      title={intl.formatMessage(messages.site)}
      className={getLogoLinkClass()}
    >
      {renderLogo()}
    </UniversalLink>
  );
};

export default Logo;
