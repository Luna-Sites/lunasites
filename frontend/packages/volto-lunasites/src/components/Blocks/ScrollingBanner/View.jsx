import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import './ScrollingBanner.scss';

const ScrollingBannerView = ({ data, className }) => {
  const { items = [] } = data;

  if (!items || items.length === 0) {
    return null;
  }

  // Create the scrolling content by repeating items to ensure continuous scroll
  const scrollingContent = [...items, ...items, ...items].map((item, index) => (
    <span key={`${index}-${item.title}`} className="scrolling-banner-item">
      <span className="scrolling-banner-title">{item.title}</span>
      {item.description && (
        <>
          <span className="scrolling-banner-separator"> • </span>
          <span className="scrolling-banner-description">
            {item.description}
          </span>
        </>
      )}
      <span className="scrolling-banner-separator"> • </span>
    </span>
  ));

  return (
    <div className={cx('scrolling-banner-block', className)}>
      <div className="scrolling-banner-container">
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
      }),
    ),
  }),
  className: PropTypes.string,
};

export default ScrollingBannerView;
