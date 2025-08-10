import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { connect } from 'react-redux';
import { Helmet } from '@plone/volto/helpers';
import { settings } from '~/config';

const AppExtras = (props) => {
  const { content, pathname } = props;
  const viewClass = content?.view
    ? `view-${content?.view?.token?.toLowerCase() || ''}`
    : '';

  const siteTitle = content?.title || 'Luna Sites';
  
  let siteDescription = content?.description;
  if (!siteDescription && content?.text?.data) {
    const textContent = content.text.data.replace(/<[^>]*>/g, '').trim();
    siteDescription = textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
  }
  if (!siteDescription) {
    siteDescription = 'Professional websites made with Luna Sites';
  }
  
  const siteImage = content?.image?.scales?.preview?.download || 
                   content?.image?.scales?.large?.download || 
                   content?.image?.download || 
                   `${settings.publicURL}/icon.svg`;
  const siteUrl = `${settings.publicURL}${pathname}`;

  return (
    <>
      {viewClass && <BodyClass className={viewClass} />}
      <Helmet>
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={siteImage} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Luna Sites" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={siteImage} />
        
        <meta property="fb:app_id" content="" />
      </Helmet>
    </>
  );
};

export default connect((state) => ({
  content: state.content.data,
  pathname: state.router.location.pathname,
}))(AppExtras);
