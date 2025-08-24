import React from 'react';
import { SidebarPortal } from '@plone/volto/components';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import { CardsGridSchema } from './schema';
import CardsGridView from './View';
import './CardsGrid.css';

const CardsGridEdit = (props) => {
  const { selected, block, data, onChangeBlock } = props;

  return (
    <>
      <CardsGridView data={data} className="cards-grid-edit" isEditMode={true} />
      
      <SidebarPortal selected={selected}>
        <InlineForm
          schema={CardsGridSchema({ ...props, intl: props.intl })}
          title="Cards Grid Settings"
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

export default CardsGridEdit;