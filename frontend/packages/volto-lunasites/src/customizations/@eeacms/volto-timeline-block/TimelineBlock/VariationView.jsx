import React from 'react';
import View from './View';
import StepsView from './StepsView';
import SchedulerView from './SchedulerView';

const VariationView = (props) => {
  const { data = {} } = props;
  const { variation = 'steps' } = data;

  // Choose the appropriate view based on variation
  switch (variation) {
    case 'scheduler':
      return <SchedulerView {...props} />;
    case 'steps':
    default:
      return <StepsView {...props} />;
  }
};

export default VariationView;