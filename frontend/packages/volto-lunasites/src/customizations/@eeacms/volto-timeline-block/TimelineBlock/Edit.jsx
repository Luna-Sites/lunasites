import React from 'react';
import { SidebarPortal } from '@plone/volto/components';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import { defineMessages } from 'react-intl';
import { BlockDataForm } from '@plone/volto/components/manage/Form';
import VariationView from './VariationView';
import schema from './schema';

const messages = defineMessages({
  steps: {
    id: 'Steps',
    defaultMessage: 'Steps',
  },
  scheduler: {
    id: 'Scheduler',
    defaultMessage: 'Scheduler',
  },
});

const Edit = (props) => {
  const {
    data = {},
    block = null,
    selected = false,
    onChangeBlock,
    intl,
  } = props;
  const blockSchema = schema(intl);

  // Enhanced schema with variation options
  const enhancedSchema = {
    ...blockSchema,
    fieldsets: [
      {
        id: 'default',
        title: 'Settings',
        fields: ['variation', 'reversed', 'hideTime', 'hideDate', 'compact', 'showTags', 'items'],
      },
      ...(data.variation === 'steps' ? [
        {
          id: 'steps_settings',
          title: 'Steps Settings',
          fields: ['vertical', 'showConnector', 'autoMarkCompleted'],
        },
      ] : []),
      ...(data.variation === 'scheduler' ? [
        {
          id: 'scheduler_settings',
          title: 'Scheduler Settings',
          fields: ['schedulerType', 'currentDate'],
        },
        ...(data.schedulerType === 'daily' ? [
          {
            id: 'daily_settings',
            title: 'Daily View Settings',
            fields: ['startHour', 'endHour'],
          },
        ] : []),
        ...(data.schedulerType === 'weekly' ? [
          {
            id: 'weekly_settings',
            title: 'Weekly View Settings',
            fields: ['weeklyStartDate', 'weeklyEndDate'],
          },
        ] : []),
        ...(data.schedulerType === 'monthly' ? [
          {
            id: 'monthly_settings',
            title: 'Monthly View Settings',
            fields: ['monthlyStartDate', 'monthlyEndDate'],
          },
        ] : []),
        {
          id: 'custom_range_settings',
          title: 'Custom Range (overrides above)',
          fields: ['startDate', 'endDate'],
        },
      ] : []),
    ],
    properties: {
      ...blockSchema.properties,
      variation: {
        title: 'Display Style',
        description: 'Choose how to display the timeline',
        type: 'string',
        choices: [
          ['steps', intl.formatMessage(messages.steps)],
          ['scheduler', intl.formatMessage(messages.scheduler)],
        ],
        default: 'steps',
      },
      vertical: {
        title: 'Vertical Layout',
        description: 'Display steps vertically instead of horizontally',
        type: 'boolean',
        default: false,
      },
      showConnector: {
        title: 'Show Connector Lines',
        description: 'Display connecting lines between steps',
        type: 'boolean',
        default: true,
      },
      autoMarkCompleted: {
        title: 'Auto Mark Completed',
        description: 'Automatically mark first steps as completed for demo purposes',
        type: 'boolean',
        default: false,
      },
    },
  };

  return (
    <>
      <VariationView {...props} mode="edit" />

      <SidebarPortal selected={selected}>
        <BlockDataForm
          schema={enhancedSchema}
          title={enhancedSchema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </>
  );
};

export default Edit;