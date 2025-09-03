import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { ConditionalLink, Component } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './SliderTemplate.scss';
import './CardStyles.scss';

const SliderTemplate = ({
  items,
  linkTitle,
  linkHref,
  isEditMode,
  b_size,
  currentPage = 1,
  showTitle = true,
  showDescription = true,
  showDate = false,
  showAuthor = false,
  titleLength = 50,
  descriptionLength = 100,
  imageAspectRatio = 'auto',
  cardStyle = 'default',
  filled = true,
  visibleItems = 3,
}) => {
  const sliderRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  let link = null;
  let href = linkHref?.[0]?.['@id'] || '';

  if (isInternalURL(href)) {
    link = (
      <ConditionalLink to={flattenToAppURL(href)} condition={!isEditMode}>
        {linkTitle || href}
      </ConditionalLink>
    );
  } else if (href) {
    link = <a href={href}>{linkTitle || href}</a>;
  }

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  const isVideoFile = (item) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
    const fileName = item.title || item.id || '';
    return (
      videoExtensions.some((ext) => fileName.toLowerCase().endsWith(ext)) ||
      (item['@type'] === 'File' &&
        item.file?.filename &&
        videoExtensions.some((ext) =>
          item.file.filename.toLowerCase().endsWith(ext),
        ))
    );
  };

  const getVideoUrl = (item) => {
    if (item.file?.download) {
      return item.file.download;
    }
    return item['@id'] + '/@@download/file';
  };

  const renderItems =
    b_size && b_size > 0
      ? items.slice((currentPage - 1) * b_size, currentPage * b_size)
      : items;

  const CustomPrevArrow = ({ className, style, onClick }) => (
    <button
      className={`${className} custom-arrow custom-prev`}
      style={style}
      onClick={onClick}
      aria-label="Previous"
    >
      <i className="ri-arrow-left-s-line"></i>
    </button>
  );

  const CustomNextArrow = ({ className, style, onClick }) => (
    <button
      className={`${className} custom-arrow custom-next`}
      style={style}
      onClick={onClick}
      aria-label="Next"
    >
      <i className="ri-arrow-right-s-line"></i>
    </button>
  );

  const settings = {
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: parseInt(visibleItems),
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    initialSlide: 0,
    swipeToSlide: false,
    focusOnSelect: false,
    variableWidth: false,
    centerMode: false,
    adaptiveHeight: false,
    lazyLoad: false,
    waitForAnimate: true,
    pauseOnHover: true,
    cssEase: 'linear',
    useCSS: true,
    useTransform: true,
    beforeChange: (current, next) => {
      console.log(
        'Moving from',
        current,
        'to',
        next,
        'visibleItems:',
        visibleItems,
        'totalItems:',
        renderItems.length,
      );
    },
    afterChange: (index) => {
      console.log('Slider moved to:', index);
    },
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(visibleItems, 2),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="listing-slider">
      <Slider ref={sliderRef} {...settings}>
        {renderItems.map((item, index) => {
          const ItemBodyTemplate = () => {
            const hasType = item['@type'];
            const CustomItemBodyTemplate = config.getComponent({
              name: 'GridListingItemTemplate',
              dependencies: [hasType],
            }).component;

            return CustomItemBodyTemplate ? (
              <CustomItemBodyTemplate item={item} />
            ) : (
              <div
                className={`card-container card-style-default aspect-ratio-${imageAspectRatio} ${filled ? 'filled' : 'transparent'}`}
              >
                <div className="image-container">
                  {(item.image_field !== '' || isVideoFile(item)) &&
                    (isVideoFile(item) ? (
                      <video
                        src={getVideoUrl(item)}
                        className="item-image"
                        muted
                        loop
                        autoPlay
                      />
                    ) : (
                      <Component
                        componentName="PreviewImage"
                        item={item}
                        alt=""
                        className="item-image"
                      />
                    ))}
                </div>
                <div className="card-content">
                  {item?.head_title && (
                    <div className="headline">{item.head_title}</div>
                  )}
                  {showTitle && (
                    <h2>{truncateText(item?.title, titleLength)}</h2>
                  )}
                  {showDescription &&
                    !item.hide_description &&
                    item?.description && (
                      <p>{truncateText(item.description, descriptionLength)}</p>
                    )}
                  {showDate && item.effective && (
                    <div className="item-date">
                      {formatDate(item.effective)}
                    </div>
                  )}
                  {showAuthor && item.creators && (
                    <div className="item-author">
                      By {item.creators.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            );
          };

          return (
            <div key={item['@id']} className="slider-item">
              <ConditionalLink item={item} condition={!isEditMode}>
                <ItemBodyTemplate item={item} />
              </ConditionalLink>
            </div>
          );
        })}
      </Slider>

      {link && <div className="footer">{link}</div>}
    </div>
  );
};

SliderTemplate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  linkTitle: PropTypes.string,
  linkHref: PropTypes.arrayOf(PropTypes.any),
  isEditMode: PropTypes.bool,
  b_size: PropTypes.number,
  currentPage: PropTypes.number,
  showTitle: PropTypes.bool,
  showDescription: PropTypes.bool,
  showDate: PropTypes.bool,
  showAuthor: PropTypes.bool,
  titleLength: PropTypes.number,
  descriptionLength: PropTypes.number,
  imageAspectRatio: PropTypes.string,
  cardStyle: PropTypes.string,
  filled: PropTypes.bool,
  visibleItems: PropTypes.number,
};

export default SliderTemplate;
