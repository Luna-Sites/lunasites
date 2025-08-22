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

// Generate time slots for hourly view
const generateHourlySlots = (startHour = 0, endHour = 23) => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push({
      value: hour,
      label: hour === 0 ? '12 AM' : 
             hour < 12 ? `${hour} AM` : 
             hour === 12 ? '12 PM' : 
             `${hour - 12} PM`,
      key: `hour-${hour}`
    });
  }
  return slots;
};

// Generate days for monthly view
const generateMonthDays = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = [];

  // Add empty cells for days before month start
  for (let i = 0; i < firstDay; i++) {
    days.push({ isEmpty: true, key: `empty-${i}` });
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      value: day,
      date: date,
      label: day.toString(),
      key: `day-${day}`
    });
  }

  return days;
};

// Generate week days
const generateWeekDays = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.map((day, index) => ({
    value: index,
    label: day,
    shortLabel: day.substring(0, 3),
    key: `weekday-${index}`
  }));
};

// Generate custom date range
const generateCustomDateRange = (startDate, endDate, moment) => {
  const start = moment.default(startDate);
  const end = moment.default(endDate);
  const days = [];
  
  let current = start.clone();
  while (current.isSameOrBefore(end, 'day')) {
    days.push({
      value: current.format('YYYY-MM-DD'),
      date: current.toDate(),
      moment: current.clone(),
      label: current.format('D'),
      fullLabel: current.format('dddd, MMM D'),
      shortLabel: current.format('ddd D'),
      key: `custom-${current.format('YYYY-MM-DD')}`
    });
    current.add(1, 'day');
  }
  
  return days;
};

const SchedulerView = ({ data, mode, moment }) => {
  const intl = useIntl();
  const { 
    items = [], 
    hideTime, 
    hideDate, 
    compact = false,
    showTags = false,
    schedulerType = 'weekly', // weekly, daily, monthly, custom
    showHours = true,
    currentDate = new Date().toISOString(),
    startDate,
    endDate,
    startHour = 0,
    endHour = 23,
    weeklyStartDate,
    weeklyEndDate,
    monthlyStartDate,
    monthlyEndDate,
  } = data;

  if (!items.length && mode === 'edit')
    return <p>{intl.formatMessage(messages.addTimelineItem)}</p>;

  const currentMoment = moment.default(currentDate);
  const currentYear = currentMoment.year();
  const currentMonth = currentMoment.month();

  // Group items by time slots
  const groupItemsByTimeSlot = (items, type, useCustomRange = false) => {
    const grouped = {};
    
    items.forEach((item, index) => {
      const itemMoment = moment.default(item.datetime);
      let key;
      
      // If using custom range for weekly/monthly, always use date strings as keys
      if (useCustomRange || type === 'custom') {
        key = itemMoment.format('YYYY-MM-DD');
      } else {
        switch (type) {
          case 'daily':
            key = itemMoment.hour();
            break;
          case 'weekly':
            key = itemMoment.day();
            break;
          case 'monthly':
            key = itemMoment.date();
            break;
          default:
            key = 0;
        }
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ ...item, originalIndex: index });
    });
    
    return grouped;
  };

  // Determine if we're using custom ranges
  const usingCustomRange = (startDate && endDate) || 
                          (weeklyStartDate && weeklyEndDate && schedulerType === 'weekly') || 
                          (monthlyStartDate && monthlyEndDate && schedulerType === 'monthly');
  
  const groupedItems = groupItemsByTimeSlot(items, schedulerType, usingCustomRange);

  const renderSchedulerItem = (item, slotKey) => {
    const datetime = moment.default(item.datetime);
    let timeDisplay = null;
    
    if (!hideDate) {
      if (hideTime) {
        timeDisplay = datetime.format('ll');
      } else {
        timeDisplay = datetime.format('LT');
      }
    }

    const getIconClass = (iconName) => {
      if (!iconName) return 'ri-calendar-event-line';
      return iconName.startsWith('ri-') ? iconName : `ri-${iconName}`;
    };

    return (
      <div 
        key={`${slotKey}-${item.originalIndex}`}
        className={cx('scheduler-item', { compact })}
      >
        <Card className={cx('scheduler-card', { compact })}>
          <Card.Content>
            <div className="scheduler-item-header">
              {item.icon && (
                <div 
                  className="scheduler-icon"
                  style={{ color: item.color || '#3b82f6' }}
                >
                  <i className={getIconClass(item.icon)} />
                </div>
              )}
              <div className="scheduler-content">
                <Card.Header className="scheduler-title">
                  {item.title}
                </Card.Header>
                {timeDisplay && (
                  <Label 
                    size="mini" 
                    color={item.color || 'blue'}
                    className="scheduler-time"
                  >
                    {timeDisplay}
                  </Label>
                )}
              </div>
            </div>
            
            {item.description && (
              <Card.Description className="scheduler-description">
                {item.description}
              </Card.Description>
            )}
            
            {item.image && (
              <div className="scheduler-image">
                <Image src={item.image} size="mini" rounded />
              </div>
            )}
            
            {showTags && item.tags && item.tags.length > 0 && (
              <div className="scheduler-tags">
                {item.tags.map((tag, i) => (
                  <Label key={i} size="mini" basic>
                    {tag}
                  </Label>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    );
  };

  const renderDailyView = () => {
    const hourSlots = generateHourlySlots(startHour, endHour);
    
    return (
      <div className="scheduler-daily">
        <div className="scheduler-header">
          <h3>{currentMoment.format('dddd, MMMM Do YYYY')}</h3>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {startHour === 0 && endHour === 23 
              ? 'Full day (24 hours)'
              : `${hourSlots[0]?.label} - ${hourSlots[hourSlots.length - 1]?.label}`
            }
          </div>
        </div>
        <div className="scheduler-grid daily">
          {hourSlots.map(slot => (
            <div key={slot.key} className="scheduler-slot">
              <div className="scheduler-time-label">
                {slot.label}
              </div>
              <div className="scheduler-events">
                {groupedItems[slot.value]?.map(item => 
                  renderSchedulerItem(item, slot.key)
                ) || <div className="scheduler-empty">No events</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    // Use custom weekly range if provided, otherwise default week
    if (weeklyStartDate && weeklyEndDate) {
      const customDays = generateCustomDateRange(weeklyStartDate, weeklyEndDate, moment);
      const startMoment = moment.default(weeklyStartDate);
      const endMoment = moment.default(weeklyEndDate);
      
      return (
        <div className="scheduler-weekly">
          <div className="scheduler-header">
            <h3>
              {startMoment.format('MMM D')} - {endMoment.format('MMM D, YYYY')}
            </h3>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
              Custom weekly range ({customDays.length} days)
            </div>
          </div>
          <div 
            className="scheduler-grid weekly custom-weekly"
            style={{ '--column-count': customDays.length }}
          >
            {customDays.map(day => (
              <div key={day.key} className="scheduler-column">
                <div className="scheduler-column-header">
                  <div className="scheduler-day-name">{day.shortLabel}</div>
                  <div className="scheduler-day-date">{day.label}</div>
                </div>
                <div className="scheduler-column-content">
                  {groupedItems[day.value]?.map(item => 
                    renderSchedulerItem(item, day.key)
                  ) || <div className="scheduler-empty">No events</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default week view
    const weekDays = generateWeekDays();
    
    return (
      <div className="scheduler-weekly">
        <div className="scheduler-header">
          <h3>Week of {currentMoment.startOf('week').format('MMMM Do, YYYY')}</h3>
        </div>
        <div className="scheduler-grid weekly">
          {weekDays.map(day => (
            <div key={day.key} className="scheduler-column">
              <div className="scheduler-column-header">
                <div className="scheduler-day-name">{day.shortLabel}</div>
                <div className="scheduler-day-date">
                  {currentMoment.clone().startOf('week').add(day.value, 'days').format('D')}
                </div>
              </div>
              <div className="scheduler-column-content">
                {groupedItems[day.value]?.map(item => 
                  renderSchedulerItem(item, day.key)
                ) || <div className="scheduler-empty">No events</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    // Use custom monthly range if provided
    if (monthlyStartDate && monthlyEndDate) {
      const customDays = generateCustomDateRange(monthlyStartDate, monthlyEndDate, moment);
      const startMoment = moment.default(monthlyStartDate);
      const endMoment = moment.default(monthlyEndDate);
      
      return (
        <div className="scheduler-monthly custom-monthly">
          <div className="scheduler-header">
            <h3>
              {startMoment.format('MMM D')} - {endMoment.format('MMM D, YYYY')}
            </h3>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
              Custom monthly range ({customDays.length} days)
            </div>
          </div>
          
          <div className="scheduler-grid custom-monthly">
            {customDays.map(day => (
              <div key={day.key} className={cx('scheduler-custom-day-cell', {
                'has-events': groupedItems[day.value]
              })}>
                <div className="scheduler-day-header">
                  <div className="scheduler-day-name">{day.shortLabel}</div>
                  <div className="scheduler-day-number">{day.label}</div>
                </div>
                <div className="scheduler-day-events">
                  {groupedItems[day.value]?.map(item => 
                    renderSchedulerItem(item, day.key)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default monthly view
    const monthDays = generateMonthDays(currentYear, currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="scheduler-monthly">
        <div className="scheduler-header">
          <h3>{currentMoment.format('MMMM YYYY')}</h3>
        </div>
        
        <div className="scheduler-weekdays">
          {weekDays.map(day => (
            <div key={day} className="scheduler-weekday-header">
              {day}
            </div>
          ))}
        </div>
        
        <div className="scheduler-grid monthly">
          {monthDays.map(day => (
            <div key={day.key} className={cx('scheduler-day-cell', { 
              'is-empty': day.isEmpty,
              'has-events': !day.isEmpty && groupedItems[day.value]
            })}>
              {!day.isEmpty && (
                <>
                  <div className="scheduler-day-number">
                    {day.label}
                  </div>
                  <div className="scheduler-day-events">
                    {groupedItems[day.value]?.map(item => 
                      renderSchedulerItem(item, day.key)
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomView = () => {
    if (!startDate || !endDate) {
      return (
        <div className="scheduler-custom-empty">
          <div className="scheduler-header">
            <h3>Custom Date Range</h3>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            Please set both start date and end date to display the custom scheduler view.
          </div>
        </div>
      );
    }

    const customDays = generateCustomDateRange(startDate, endDate, moment);
    const startMoment = moment.default(startDate);
    const endMoment = moment.default(endDate);
    
    return (
      <div className="scheduler-custom">
        <div className="scheduler-header">
          <h3>
            {startMoment.format('MMM D, YYYY')} - {endMoment.format('MMM D, YYYY')}
          </h3>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
            {customDays.length} days selected
          </div>
        </div>
        <div 
          className="scheduler-grid custom"
          style={{ '--column-count': customDays.length }}
        >
          {customDays.map(day => (
            <div key={day.key} className={cx('scheduler-column custom', {
              'has-events': groupedItems[day.value]
            })}>
              <div className="scheduler-column-header">
                <div className="scheduler-day-name">{day.shortLabel}</div>
                <div className="scheduler-day-date">{day.label}</div>
              </div>
              <div className="scheduler-column-content">
                {groupedItems[day.value]?.map(item => 
                  renderSchedulerItem(item, day.key)
                ) || <div className="scheduler-empty">No events</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSchedulerView = () => {
    // If startDate and endDate are set, always use custom view regardless of schedulerType
    if (startDate && endDate) {
      return renderCustomView();
    }
    
    switch (schedulerType) {
      case 'daily':
        return renderDailyView();
      case 'monthly':
        return renderMonthlyView();
      case 'weekly':
      default:
        return renderWeeklyView();
    }
  };

  // Calculate number of columns for adaptive styling
  const getColumnCount = () => {
    if (startDate && endDate) {
      const customDays = generateCustomDateRange(startDate, endDate, moment);
      return customDays.length;
    }
    
    if (schedulerType === 'weekly') {
      if (weeklyStartDate && weeklyEndDate) {
        const customDays = generateCustomDateRange(weeklyStartDate, weeklyEndDate, moment);
        return customDays.length;
      }
      return 7; // default week
    }
    
    return 1; // daily or monthly don't use columns in the same way
  };

  return (
    <div 
      className={cx('scheduler-container', schedulerType, { compact })}
      data-columns={getColumnCount()}
    >
      {renderSchedulerView()}
    </div>
  );
};

export default compose(injectLazyLibs(['moment']))(SchedulerView);