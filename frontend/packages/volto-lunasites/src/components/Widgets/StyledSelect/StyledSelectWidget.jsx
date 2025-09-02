import React from 'react';
import {
  Select,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
} from 'react-aria-components';
import { Icon } from '@plone/volto/components';
import downSVG from '@plone/volto/icons/down-key.svg';
import checkSVG from '@plone/volto/icons/check.svg';
import './StyledSelectWidget.scss';

const StyledSelectWidget = (props) => {
  const { id, title, required, value, onChange, choices = [], placeholder } = props;

  return (
    <div className="inline field styled-select-field">
      <div className="wrapper">
        {title && (
          <label htmlFor={`field-${id}`}>
            {title}
            {required && <span className="required"> *</span>}
          </label>
        )}
        <Select 
          selectedKey={value}
          onSelectionChange={(key) => onChange(id, key)}
          className="styled-select"
          placeholder={placeholder || 'Select an option'}
        >
          <Button className="styled-select-button">
            <SelectValue className="styled-select-value" />
            <Icon 
              name={downSVG} 
              size="14px" 
              className="styled-select-arrow"
            />
          </Button>
          
          <Popover className="styled-select-popover">
            <ListBox className="styled-select-listbox">
              {choices.map(([choiceValue, choiceLabel]) => (
                <ListBoxItem
                  key={choiceValue}
                  id={choiceValue}
                  className="styled-select-item"
                  textValue={choiceLabel}
                >
                  <span className="styled-select-item-label">
                    {choiceLabel}
                  </span>
                  {value === choiceValue && (
                    <Icon 
                      name={checkSVG} 
                      size="14px" 
                      className="styled-select-item-check"
                    />
                  )}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </Select>
      </div>
    </div>
  );
};

export default StyledSelectWidget;