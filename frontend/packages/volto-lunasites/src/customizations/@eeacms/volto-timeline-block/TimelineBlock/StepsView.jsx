import React from 'react';
import { compose } from 'redux';
import cx from 'classnames';
import { Grid, Card, Label, Image } from 'semantic-ui-react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  addTimelineItem: {
    id: 'Add Timeline items',
    defaultMessage: 'Add Timeline items',
  },
});

function Steps({ children, vertical, showConnector }) {
  return (
    <div className={cx('steps-timeline', { vertical, 'show-connector': showConnector })}>
      {vertical ? (
        <div className="steps-vertical-container">{children}</div>
      ) : (
        <div className="steps-horizontal-container">{children}</div>
      )}
    </div>
  );
}

Steps.Item = ({ 
  step, 
  title, 
  description, 
  time, 
  image, 
  tags, 
  color, 
  icon, 
  completed, 
  active, 
  vertical,
  compact,
  showTags,
  isLast 
}) => {
  const getIconClass = (iconName) => {
    if (!iconName) return 'ri-check-line';
    return iconName.startsWith('ri-') ? iconName : `ri-${iconName}`;
  };

  return (
    <div className={cx('step-item', { vertical, compact, completed, active, 'is-last': isLast })}>
      <div className="step-indicator">
        <div 
          className={cx('step-circle', { completed, active })}
          style={{
            backgroundColor: completed ? '#10b981' : active ? (color || 'blue') : 'var(--lunasites-primary-color)',
          }}
        >
          {completed ? (
            <i className="ri-check-line" style={{ color: 'white', fontSize: '1.2rem' }} />
          ) : icon ? (
            <i 
              className={getIconClass(icon)} 
              style={{ 
                color: active ? 'white' : '#9ca3af', 
                fontSize: compact ? '1rem' : '1.2rem' 
              }} 
            />
          ) : (
            <span 
              style={{ 
                color: active ? 'white' : '#9ca3af', 
                fontSize: compact ? '0.9rem' : '1rem',
                fontWeight: '600'
              }}
            >
              {step}
            </span>
          )}
        </div>
        {!isLast && (
          <div 
            className={cx('step-connector', { completed, active })}
            style={{
              backgroundColor: completed ? '#10b981' : active ? (color || 'blue') : 'var(--lunasites-primary-color)',
            }}
          />
        )}
      </div>
      
      <div className="step-content">
        <Card fluid className={cx('step-card', { compact })}>
          <Card.Content>
            {time && (
              <Label 
                size={compact ? 'small' : undefined}
                color={completed ? 'green' : active ? (color || 'blue') : 'grey'}
                className="step-time"
              >
                {time}
              </Label>
            )}
            {image && (
              <div className="step-image">
                <Image src={image} size="small" rounded />
              </div>
            )}
            <Card.Header className={cx('step-title', { compact })}>
              {title}
            </Card.Header>
            <Card.Description className="step-description">
              {description}
            </Card.Description>
            {showTags && tags && tags.length > 0 && (
              <div className="step-tags">
                {tags.map((tag, i) => (
                  <Label key={i} size="mini" basic>
                    {tag}
                  </Label>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

const StepsView = ({ data, mode, moment }) => {
  const intl = useIntl();
  const { 
    items = [], 
    hideTime, 
    hideDate, 
    compact = false,
    showTags = false,
    vertical = false,
    showConnector = true,
    autoMarkCompleted = false
  } = data;

  if (!items.length && mode === 'edit')
    return <p>{intl.formatMessage(messages.addTimelineItem)}</p>;
  
  // Determine which steps should be marked as completed/active
  const getStepStatus = (index, itemDate) => {
    if (autoMarkCompleted && itemDate) {
      const now = moment.default();
      const stepDate = moment.default(itemDate);
      const isCompleted = stepDate.isBefore(now, 'day');
      return { completed: isCompleted, active: false };
    }
    return { completed: false, active: false };
  };

  return (
    <Steps vertical={vertical} showConnector={showConnector}>
      {items.map((item, index) => {
        const datetime = moment.default(item.datetime);
        let timeDisplay = null;
        
        if (!hideDate) {
          if (hideTime) {
            timeDisplay = datetime.format('ll');
          } else {
            timeDisplay = datetime.format('lll');
          }
        }
        
        const { completed, active } = getStepStatus(index, item.datetime);
        
        return (
          <Steps.Item
            key={`step-item-${index}-${item.title}`}
            step={index + 1}
            title={item.title}
            description={item.description}
            time={timeDisplay}
            image={item.image}
            tags={showTags && item.tags ? item.tags : null}
            color={item.color || 'blue'}
            icon={item.icon}
            completed={completed}
            active={active}
            vertical={vertical}
            compact={compact}
            showTags={showTags}
            isLast={index === items.length - 1}
          />
        );
      })}
    </Steps>
  );
};

export default compose(injectLazyLibs(['moment']))(StepsView);