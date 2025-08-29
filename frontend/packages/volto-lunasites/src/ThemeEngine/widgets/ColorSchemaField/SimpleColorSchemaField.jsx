import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import { Button, Header } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import CompactColorPicker from './CompactColorPicker';

const SimpleColorSchemaField = (props) => {
  const { id, value, onChange } = props;

  const [colorSchema, setColorSchema] = React.useState({
    background_color: '',
    primary_color: '',
    secondary_color: '',
    header_color: '',
    text_color: '',
    accent_color: '',
    ...value,
  });

  const colorFields = [
    { key: 'background_color', label: 'Background' },
    { key: 'primary_color', label: 'Primary' },
    { key: 'secondary_color', label: 'Secondary' },
    { key: 'header_color', label: 'Header' },
    { key: 'text_color', label: 'Text' },
    { key: 'accent_color', label: 'Accent' },
  ];

  React.useEffect(() => {
    if (value) {
      setColorSchema((prev) => ({ ...prev, ...value }));
    }
  }, [value]);

  React.useEffect(() => {
    applyCSSVariables(getEffectiveSchema());
  }, [colorSchema]);

  const getEffectiveSchema = () => {
    const defaults = {
      background_color: '#ffffff',
      primary_color: '#094ce1',
      secondary_color: '#e73d5c',
      header_color: '#2c3e50',
      text_color: '#333333',
      accent_color: '#6bb535',
    };

    const current = {};
    Object.entries(colorSchema).forEach(([key, value]) => {
      if (value && value.trim()) {
        current[key] = value;
      }
    });

    return { ...defaults, ...current };
  };

  const handleColorChange = (field, color) => {
    const updatedSchema = { ...colorSchema, [field]: color || '' };
    setColorSchema(updatedSchema);
    onChange(id, updatedSchema);
    applyCSSVariables({ ...getEffectiveSchema(), [field]: color || '' });
  };

  const applyCSSVariables = (schema) => {
    const root = document.documentElement;
    Object.entries(schema).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--lunasites-${key.replace('_', '-')}`, value);
      }
    });
  };

  return (
    <FormFieldWrapper
      {...props}
      draggable={false}
      className="color-schema-field"
    >
      <div style={{ width: '100%' }}>
        <Header as="h5" style={{ marginBottom: '10px', fontSize: '13px' }}>
          Color Schema
        </Header>

        {colorFields.map((field) => (
          <div key={field.key} style={{ marginBottom: '12px', width: '100%' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '4px',
              }}
            >
              {field.label}
            </div>
            <div style={{ width: '100%' }}>
              <CompactColorPicker
                id={field.key}
                value={colorSchema[field.key]}
                onChange={(_, color) => handleColorChange(field.key, color)}
              />
            </div>
          </div>
        ))}

        <Button
          size="mini"
          basic
          fluid
          onClick={() => {
            setColorSchema({
              background_color: '',
              primary_color: '',
              secondary_color: '',
              header_color: '',
              text_color: '',
              accent_color: '',
            });
            onChange(id, {});
            applyCSSVariables(getEffectiveSchema());
            toast.success('Colors cleared');
          }}
          style={{ marginTop: '10px', fontSize: '10px' }}
        >
          Clear All
        </Button>
      </div>
    </FormFieldWrapper>
  );
};

export default SimpleColorSchemaField;
