import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { getFieldURL } from '@plone/volto/helpers';
import './ScrollingBanner.scss';

const ScrollingBannerView = ({ data, className }) => {
  const {
    items = [],
    animationSpeed = 3,
    stickyBottom = false,
    backgroundColor = '#ff0000',
    textColor = '#ffffff',
  } = data;

  if (!items || items.length === 0) {
    return null;
  }

  // Create the scrolling content by repeating items multiple times to ensure continuous coverage
  const repeatedItems = [...items, ...items, ...items, ...items, ...items];
  const scrollingContent = repeatedItems.map((item, index) => {
    const itemContent = (
      <>
        <span className="scrolling-banner-alert">⚠️</span>
        <span className="scrolling-banner-title">{item.title}</span>
        {item.description && (
          <>
            <span className="scrolling-banner-separator"> • </span>
            <span className="scrolling-banner-description">{item.description}</span>
          </>
        )}
        <span className="scrolling-banner-separator"> • </span>
      </>
    );

    const itemLink = getFieldURL(item.link);
    
    return (
      <span key={`${index}-${item.title}`} className="scrolling-banner-item">
        {itemLink ? (
          <a 
            href={itemLink}
            className="scrolling-banner-link"
            target={item.link && !itemLink.startsWith('/') ? '_blank' : undefined}
            rel={item.link && !itemLink.startsWith('/') ? 'noopener noreferrer' : undefined}
          >
            {itemContent}
          </a>
        ) : (
          itemContent
        )}
      </span>
    );
  });

  // Smoother speed progression: starts at 45s for speed=1, decreases more gradually
  const calculatedSpeed = 50 - (animationSpeed * 4);
  const bannerStyle = {
    '--animation-speed': `${calculatedSpeed}s`,
    backgroundColor,
    color: textColor,
  };

  return (
    <div className={cx(
      'scrolling-banner-block', 
      'full-width',
      { 'sticky-bottom': stickyBottom },
      className
    )}>
      <div className="scrolling-banner-container" style={bannerStyle}>
        <div className="scrolling-banner-content">{scrollingContent}</div>
      </div>
    </div>
  );
};

ScrollingBannerView.propTypes = {
  data: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        link: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.object,
          PropTypes.array,
        ]),
      })
    ),
    animationSpeed: PropTypes.number,
    stickyBottom: PropTypes.bool,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
  }),
  className: PropTypes.string,
};

export default ScrollingBannerView;
