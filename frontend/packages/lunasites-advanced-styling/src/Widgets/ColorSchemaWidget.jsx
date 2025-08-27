import React from 'react';
import { FormFieldWrapper, Icon } from '@plone/volto/components';
import { Button, Modal, Header, Card, Grid, Dropdown, Message, Loader } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import paintBrushSVG from '@plone/volto/icons/paint.svg';
import starSVG from '@plone/volto/icons/star.svg';
import SimpleColorPicker from './SimpleColorPicker';

const ColorSchemaWidget = (props) => {
  const { id, value, onChange, title } = props;
  const dispatch = useDispatch();
  
  const [showModal, setShowModal] = React.useState(false);
  const [colorSchema, setColorSchema] = React.useState({
    background_color: '#ffffff',
    primary_color: '#0070ae',
    secondary_color: '#e73d5c',
    header_color: '#2c3e50',
    text_color: '#333333',
    accent_color: '#6bb535',
    ...value
  });
  const [presets, setPresets] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState('');

  const colorFields = [
    { key: 'background_color', label: 'Background Color', description: 'Main background color for your site' },
    { key: 'primary_color', label: 'Primary Color', description: 'Main brand color used for buttons and links' },
    { key: 'secondary_color', label: 'Secondary Color', description: 'Secondary accent color for highlights' },
    { key: 'header_color', label: 'Header Color', description: 'Navigation and header background color' },
    { key: 'text_color', label: 'Text Color', description: 'Main text color for readability' },
    { key: 'accent_color', label: 'Accent Color', description: 'Additional accent color for emphasis' }
  ];

  // Load color schema data when modal opens
  React.useEffect(() => {
    if (showModal) {
      loadColorSchemaData();
    }
  }, [showModal]);

  const loadColorSchemaData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/@color-schema', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setColorSchema({ ...colorSchema, ...data.current_schema });
        setPresets(data.presets || []);
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to load color schema:', error);
      toast.error('Failed to load color schema data');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (field, color) => {
    const updatedSchema = { ...colorSchema, [field]: color };
    setColorSchema(updatedSchema);
  };

  const applyColorSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch('/@color-schema', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schema: colorSchema }),
      });
      
      if (response.ok) {
        const data = await response.json();
        onChange(id, colorSchema);
        setSuggestions(data.suggestions || []);
        toast.success('Color schema applied successfully!');
        
        // Apply CSS custom properties to document root
        applyCSSVariables(colorSchema);
      } else {
        throw new Error('Failed to update color schema');
      }
    } catch (error) {
      console.error('Failed to apply color schema:', error);
      toast.error('Failed to apply color schema');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = async (presetName) => {
    setLoading(true);
    try {
      const response = await fetch('/@color-schema', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preset_name: presetName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setColorSchema(data.schema);
        setSuggestions(data.suggestions || []);
        onChange(id, data.schema);
        toast.success(`Applied preset: ${presetName}`);
        
        // Apply CSS custom properties
        applyCSSVariables(data.schema);
      } else {
        throw new Error('Failed to apply preset');
      }
    } catch (error) {
      console.error('Failed to apply preset:', error);
      toast.error('Failed to apply color preset');
    } finally {
      setLoading(false);
    }
  };

  const applyCSSVariables = (schema) => {
    const root = document.documentElement;
    Object.entries(schema).forEach(([key, value]) => {
      root.style.setProperty(`--lunasites-${key.replace('_', '-')}`, value);
    });
  };

  const applySuggestion = (suggestion) => {
    // Determine which field to update based on suggestion name
    let field = 'accent_color';
    if (suggestion.name.includes('Primary')) field = 'primary_color';
    else if (suggestion.name.includes('Secondary')) field = 'secondary_color';
    else if (suggestion.name.includes('Header')) field = 'header_color';
    
    handleColorChange(field, suggestion.color);
  };

  const getPresetOptions = () => {
    return presets.map(preset => ({
      key: preset.name,
      text: preset.name,
      value: preset.name
    }));
  };

  const generateColorPreview = (schema) => {
    // Filter out background color from circles and use it as backdrop
    const circleColors = colorFields.filter(field => field.key !== 'background_color');
    const backgroundColor = schema.background_color || '#ffffff';
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '40px',
        borderRadius: '20px',
        backgroundColor: backgroundColor,
        border: '1px solid #ddd',
        padding: '5px 10px',
        position: 'relative',
        overflow: 'visible'
      }}>
        {circleColors.map((field, index) => (
          <div
            key={field.key}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: schema[field.key] || '#ffffff',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginLeft: index > 0 ? '-10px' : '0',
              zIndex: circleColors.length - index,
              position: 'relative'
            }}
            title={field.label}
          />
        ))}
      </div>
    );
  };

  return (
    <FormFieldWrapper
      {...props}
      draggable={false}
      className="color-schema-widget"
    >
      <div className="wrapper">
        <Button
          icon
          onClick={() => setShowModal(true)}
          size="large"
          title="Open Color Schema Editor"
          style={{ marginRight: '10px' }}
        >
          <Icon name={paintBrushSVG} size="18px" />
          Color Schema
        </Button>
        
        {value && generateColorPreview(value)}

        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          size="large"
          closeIcon
        >
          <Header>
            <Icon name={paintBrushSVG} />
            Color Schema Editor
          </Header>
          
          <Modal.Content scrolling>
            {loading && <Loader active inline="centered">Loading...</Loader>}
            
            {/* Preset Selection */}
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>
                  <Header as="h3">Quick Presets</Header>
                  <Dropdown
                    placeholder="Choose a color preset..."
                    fluid
                    search
                    selection
                    value={selectedPreset}
                    onChange={(_, { value }) => {
                      setSelectedPreset(value);
                      applyPreset(value);
                    }}
                    options={getPresetOptions()}
                    style={{ marginBottom: '20px' }}
                  />
                  
                  {presets.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                      <Header as="h4">Preview Presets</Header>
                      <Grid>
                        {presets.slice(0, 3).map(preset => (
                          <Grid.Column key={preset.name} width={5}>
                            <Card
                              onClick={() => applyPreset(preset.name)}
                              style={{ cursor: 'pointer' }}
                            >
                              <Card.Content>
                                <Card.Header style={{ fontSize: '12px' }}>{preset.name}</Card.Header>
                                {generateColorPreview(preset)}
                              </Card.Content>
                            </Card>
                          </Grid.Column>
                        ))}
                      </Grid>
                    </div>
                  )}
                </Grid.Column>
              </Grid.Row>

              {/* Color Customization */}
              <Grid.Row>
                <Grid.Column width={10}>
                  <Header as="h3">Customize Colors</Header>
                  <Grid>
                    {colorFields.map(field => (
                      <Grid.Row key={field.key}>
                        <Grid.Column width={6}>
                          <strong>{field.label}</strong>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            {field.description}
                          </div>
                        </Grid.Column>
                        <Grid.Column width={10}>
                          <SimpleColorPicker
                            id={field.key}
                            value={colorSchema[field.key]}
                            onChange={(_, color) => handleColorChange(field.key, color)}
                          />
                        </Grid.Column>
                      </Grid.Row>
                    ))}
                  </Grid>
                </Grid.Column>

                {/* Suggestions */}
                <Grid.Column width={6}>
                  <Header as="h3">
                    <Icon name={starSVG} size="14px" />
                    Color Suggestions
                  </Header>
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <Card key={index} style={{ marginBottom: '10px' }}>
                        <Card.Content>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: suggestion.color,
                                borderRadius: '50%',
                                marginRight: '10px',
                                border: '1px solid #ddd'
                              }}
                            />
                            <strong style={{ fontSize: '12px' }}>{suggestion.name}</strong>
                          </div>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                            {suggestion.usage}
                          </div>
                          <Button
                            size="mini"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            Apply
                          </Button>
                        </Card.Content>
                      </Card>
                    ))
                  ) : (
                    <Message info>
                      <Message.Header>No suggestions available</Message.Header>
                      <p>Configure your primary color to get smart suggestions.</p>
                    </Message>
                  )}
                </Grid.Column>
              </Grid.Row>

              {/* Preview */}
              <Grid.Row>
                <Grid.Column width={16}>
                  <Header as="h3">Color Schema Preview</Header>
                  <Card fluid>
                    <Card.Content>
                      {generateColorPreview(colorSchema)}
                      <div style={{ marginTop: '15px', fontSize: '12px' }}>
                        <strong>CSS Variables (automatically applied):</strong>
                        <pre style={{ marginTop: '10px', fontSize: '10px', backgroundColor: '#f8f9fa', padding: '10px' }}>
                          {Object.entries(colorSchema).map(([key, value]) => 
                            `--lunasites-${key.replace('_', '-')}: ${value};\n`
                          ).join('')}
                        </pre>
                      </div>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>

          <Modal.Actions>
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              color="blue" 
              onClick={applyColorSchema}
              loading={loading}
              disabled={loading}
            >
              Apply Color Schema
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    </FormFieldWrapper>
  );
};

export default ColorSchemaWidget;