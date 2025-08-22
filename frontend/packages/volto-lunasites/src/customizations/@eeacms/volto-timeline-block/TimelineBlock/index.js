import View from './View';
import StepsView from './StepsView';
import SchedulerView from './SchedulerView';
import VariationView from './VariationView';
import Edit from './Edit';
import schema from './schema';

// Timeline variations
const timelineVariations = [
  {
    id: 'steps',
    title: 'Steps',
    view: StepsView,
    isDefault: true,
  },
  {
    id: 'scheduler',
    title: 'Scheduler',
    view: SchedulerView,
    isDefault: false,
  },
];

export { View, StepsView, SchedulerView, VariationView, Edit, schema, timelineVariations };
export default {
  id: 'timeline',
  title: 'Timeline',
  edit: Edit,
  view: VariationView,
  schema,
  variations: timelineVariations,
};