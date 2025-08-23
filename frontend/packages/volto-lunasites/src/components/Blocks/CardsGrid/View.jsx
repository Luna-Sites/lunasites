import React from 'react';
import cx from 'classnames';
import './CardsGrid.css';

const CardsGridView = ({ data, className }) => {
  const { cards = [], columns = 4, variation = 'card' } = data;

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // If it's an object with url property (from ImageWidget)
    if (image?.url) {
      return image.url;
    }
    
    // If image is an array (from object_browser), get the first item
    if (Array.isArray(image) && image.length > 0) {
      const firstItem = image[0];
      if (typeof firstItem === 'object') {
        return firstItem?.['@id'] || firstItem?.url || firstItem;
      }
      return firstItem;
    }
    
    // If it's a string (direct URL)
    if (typeof image === 'string') {
      return image;
    }
    
    // If it's an object with @id
    if (image?.['@id']) {
      return image['@id'];
    }
    
    return null;
  };

  // Helper function to get link URL
  const getLinkUrl = (link) => {
    if (!link) return null;
    // If link is an array (from object_browser), get the first item
    if (Array.isArray(link) && link.length > 0) {
      return link[0]?.['@id'] || link[0];
    }
    // If it's a string (direct URL)
    if (typeof link === 'string') {
      return link;
    }
    // If it's an object with @id
    if (link?.['@id']) {
      return link['@id'];
    }
    return null;
  };

  return (
    <div
      className={cx(
        'block',
        'cards-grid',
        `cards-grid-${variation}`,
        `columns-${columns}`,
        className,
      )}
    >
      {data.headline && <h2 className="cards-grid-headline">{data.headline}</h2>}
      
      <div className="cards-grid-container">
        {cards.map((card, index) => {
          const imageUrl = getImageUrl(card.image);
          const linkUrl = getLinkUrl(card.link);
          
          return (
            <div key={index} className="card-item">
              {variation === 'icon' && imageUrl && (
                <div className="card-icon">
                  <img src={imageUrl} alt={card.title || ''} />
                </div>
              )}
              
              {variation === 'card' && imageUrl && (
                <div className="card-image">
                  <img src={imageUrl} alt={card.title || ''} />
                </div>
              )}
            
            {card.title && (
              <h3 className="card-title">{card.title}</h3>
            )}
            
            {card.description && (
              <p className="card-description">{card.description}</p>
            )}
            
              {linkUrl && (
                <a href={linkUrl} className="card-link">
                  {card.linkText || 'Read more'}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardsGridView;