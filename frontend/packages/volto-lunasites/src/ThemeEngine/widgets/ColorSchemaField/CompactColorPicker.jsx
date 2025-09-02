import React from 'react';
import { Button } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import clearSVG from '@plone/volto/icons/clear.svg';
import SimpleColorPicker from '../../../components/Widgets/SimpleColorPicker';

const CompactColorPicker = (props) => {
  const { id, value, onChange } = props;

  const handleClear = () => {
    onChange(id, '');
  };

  return (
    <div
      className="compact-color-picker"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid #ddd',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <SimpleColorPicker
          id={id}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default CompactColorPicker;
