import React from 'react';
import { FormFieldWrapper, Icon } from '@plone/volto/components';
import { Button, Modal, Header, Dropdown, Radio } from 'semantic-ui-react';
import clearSVG from '@plone/volto/icons/clear.svg';

import loadable from '@loadable/component';
const ChromePicker = loadable(() => import('react-color/lib/Chrome'));

const SimpleColorPicker = (props) => {
  const { id, value, onChange } = props;

  // Only show gradient option for backgroundColor field
  const showGradientOption = id.includes('backgroundColor');
  const [showPicker, setShowPicker] = React.useState(false);

  // Detect if current value is a gradient
  const isCurrentValueGradient =
    value &&
    (value.startsWith('linear-gradient') ||
      value.startsWith('radial-gradient'));

  const [isGradient, setIsGradient] = React.useState(
    showGradientOption && isCurrentValueGradient,
  );

  // Get saved colors from localStorage
  const getSavedColors = () => {
    try {
      const saved = localStorage.getItem('volto-color-picker-custom-colors');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
      return [];
    }
  };

  // Get saved gradients from localStorage
  const getSavedGradients = () => {
    try {
      const saved = localStorage.getItem('volto-color-picker-custom-gradients');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not load gradients from localStorage:', e);
      return [];
    }
  };

  const [customColors, setCustomColors] = React.useState(getSavedColors);
  const [originalCustomColors, setOriginalCustomColors] =
    React.useState(getSavedColors);
  const [customGradients, setCustomGradients] =
    React.useState(getSavedGradients);
  const [originalCustomGradients, setOriginalCustomGradients] =
    React.useState(getSavedGradients);

  // Extract gradient info from current value
  const extractGradientInfo = React.useCallback(() => {
    if (isCurrentValueGradient) {
      // Extract direction and colors from gradient string
      const match = value.match(/linear-gradient\(([^,]+),\s*(.+)\)/);
      if (match) {
        const direction = match[1].trim();
        const colorsString = match[2];
        const colors = colorsString.split(',').map((color) => color.trim());
        return { direction, colors };
      }
    }
    return { direction: 'to right', colors: [value || '#ffffff', '#000000'] };
  }, [value, isCurrentValueGradient]);

  const gradientInfo = extractGradientInfo();
  const [gradientColors, setGradientColors] = React.useState(
    gradientInfo.colors,
  );
  const [gradientDirection, setGradientDirection] = React.useState(
    gradientInfo.direction,
  );

  // Update state when value changes from outside
  React.useEffect(() => {
    const newIsGradient =
      showGradientOption &&
      value &&
      (value.startsWith('linear-gradient') ||
        value.startsWith('radial-gradient'));
    setIsGradient(newIsGradient);

    if (newIsGradient) {
      const newGradientInfo = extractGradientInfo();
      setGradientColors(newGradientInfo.colors);
      setGradientDirection(newGradientInfo.direction);
    }
  }, [value, extractGradientInfo, showGradientOption]);

  // Load colors and gradients from localStorage when component mounts
  React.useEffect(() => {
    const savedColors = getSavedColors();
    const savedGradients = getSavedGradients();
    setCustomColors(savedColors);
    setOriginalCustomColors(savedColors);
    setCustomGradients(savedGradients);
    setOriginalCustomGradients(savedGradients);
  }, []);

  const quickColors = {
    primary: '#0070ae',
    secondary: '#e73d5c',
    tertiary: '#6bb535',
  };

  const gradientDirections = [
    { key: 'to right', text: 'Left to Right', value: 'to right' },
    { key: 'to left', text: 'Right to Left', value: 'to left' },
    { key: 'to bottom', text: 'Top to Bottom', value: 'to bottom' },
    { key: 'to top', text: 'Bottom to Top', value: 'to top' },
    { key: 'to bottom right', text: 'Diagonal ↘', value: 'to bottom right' },
    { key: 'to bottom left', text: 'Diagonal ↙', value: 'to bottom left' },
  ];

  const addColorToGradient = () => {
    setGradientColors([...gradientColors, '#000000']);
  };

  const removeColorFromGradient = (index) => {
    if (gradientColors.length > 2) {
      const newColors = gradientColors.filter((_, i) => i !== index);
      setGradientColors(newColors);
    }
  };

  const updateGradientColor = (index, color) => {
    const newColors = [...gradientColors];
    newColors[index] = color;
    setGradientColors(newColors);
  };

  const addToSavedColorsTemporary = (color) => {
    if (color && !customColors.includes(color)) {
      setCustomColors([...customColors, color]);
    }
  };

  const saveColorsToStorage = (colors) => {
    try {
      localStorage.setItem(
        'volto-color-picker-custom-colors',
        JSON.stringify(colors),
      );
    } catch (e) {
      console.warn('Could not save colors to localStorage:', e);
    }
  };

  const saveGradientsToStorage = (gradients) => {
    try {
      localStorage.setItem(
        'volto-color-picker-custom-gradients',
        JSON.stringify(gradients),
      );
    } catch (e) {
      console.warn('Could not save gradients to localStorage:', e);
    }
  };

  const addToSavedGradientsTemporary = (gradient) => {
    if (gradient && !customGradients.includes(gradient)) {
      setCustomGradients([...customGradients, gradient]);
    }
  };

  const applyColor = () => {
    if (isGradient) {
      // Save gradient
      const gradientValue = `linear-gradient(${gradientDirection}, ${gradientColors.join(', ')})`;

      if (!originalCustomGradients.includes(gradientValue)) {
        const newCustomGradients = [...customGradients, gradientValue];
        setCustomGradients(newCustomGradients);
        setOriginalCustomGradients(newCustomGradients);
        saveGradientsToStorage(newCustomGradients);
      } else {
        setOriginalCustomGradients(customGradients);
        saveGradientsToStorage(customGradients);
      }

      onChange(id, gradientValue);
    } else {
      // Save color
      const colorToSave = value;
      if (colorToSave && !originalCustomColors.includes(colorToSave)) {
        const newCustomColors = [...customColors, colorToSave];
        setOriginalCustomColors(newCustomColors);
        saveColorsToStorage(newCustomColors);
      } else {
        setOriginalCustomColors(customColors);
        saveColorsToStorage(customColors);
      }

      onChange(id, value);
    }
    setShowPicker(false);
  };

  const handleCloseModal = () => {
    // Revert to original colors and gradients if not applied
    setCustomColors(originalCustomColors);
    setCustomGradients(originalCustomGradients);
    setShowPicker(false);
  };

  return (
    <FormFieldWrapper
      {...props}
      draggable={false}
      className="simple-color-picker-widget"
    >
      <div className="wrapper">
        <Button.Group>
          <Button
            style={{
              ...(value &&
              (value.startsWith('linear-gradient') ||
                value.startsWith('radial-gradient'))
                ? { background: value }
                : { backgroundColor: value }),
            }}
            onClick={() => setShowPicker(!showPicker)}
            size="huge"
            title="Pick color"
          >
            {''}
          </Button>
          <Button
            compact
            style={{ paddingLeft: '8px', paddingRight: '0px' }}
            onClick={() => {
              setShowPicker(false);
              onChange(id, null);
            }}
          >
            <Icon name={clearSVG} size="18px" color="red" />
          </Button>
        </Button.Group>

        <Modal
          open={showPicker}
          onClose={handleCloseModal}
          size="small"
          closeIcon
          style={{
            position: 'fixed',
            right: '20px',
            top: '20px',
            left: 'auto',
            transform: 'none',
            margin: '0',
            width: '350px',
            height: 'calc(100vh - 40px)',
            maxHeight: 'calc(100vh - 40px)',
            overflow: 'hidden',
          }}
        >
          <Header icon="paint brush" content="Color Picker" />
          <Modal.Content
            style={{
              height: 'calc(100vh - 120px)',
              overflowY: 'auto',
              padding: '20px',
            }}
          >
            <div>
              <Header as="h4">Quick Colors</Header>
              {/* <div className="quick-colors">
                {Object.entries(quickColors).map(([name, color]) => (
                  <Button
                    key={name}
                    size="small"
                    style={{ backgroundColor: color, margin: '2px' }}
                    onClick={() => {
                      if (isGradient) {
                        updateGradientColor(0, color);
                      } else {
                        onChange(id, color);
                        setShowPicker(false);
                      }
                    }}
                    title={name}
                  >
                    {name}
                  </Button>
                ))}
              </div> */}

              {showGradientOption && (
                <>
                  <Header as="h4">Mode</Header>
                  <div style={{ marginBottom: '20px' }}>
                    <Radio
                      label="Simple Color"
                      name="colorMode"
                      value="simple"
                      checked={!isGradient}
                      onChange={() => setIsGradient(false)}
                      style={{ marginRight: '20px' }}
                    />
                    <Radio
                      label="Gradient"
                      name="colorMode"
                      value="gradient"
                      checked={isGradient}
                      onChange={() => setIsGradient(true)}
                    />
                  </div>
                </>
              )}
              {showGradientOption && isGradient ? (
                // Show saved gradients when in gradient mode
                customGradients.length > 0 && (
                  <>
                    <Header as="h4">Saved Gradients</Header>
                    <div className="custom-gradients">
                      {customGradients.map((gradient, index) => (
                        <div
                          key={index}
                          style={{
                            width: '60px',
                            height: '30px',
                            background: gradient,
                            border: '2px solid #ccc',
                            borderRadius: '4px',
                            margin: '2px',
                            cursor: 'pointer',
                            display: 'inline-block',
                          }}
                          onClick={() => {
                            onChange(id, gradient);
                            setShowPicker(false);
                          }}
                          title={gradient}
                        />
                      ))}
                    </div>
                  </>
                )
              ) : (
                // Show saved colors when in color mode
                <>
                  <Header as="h4">Saved Colors</Header>
                  <div className="custom-colors">
                    {customColors.map((color, index) => (
                      <Button
                        key={index}
                        size="mini"
                        circular
                        style={{ backgroundColor: color, margin: '2px' }}
                        onClick={() => {
                          onChange(id, color);
                          setShowPicker(false);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
              {!isGradient || !showGradientOption ? (
                <div>
                  <Header as="h4" style={{ paddingTop: '10px' }}>
                    Color Picker
                  </Header>
                  <ChromePicker
                    color={value || '#000'}
                    onChange={(color) => {
                      onChange(id, color.hex);
                    }}
                    onChangeComplete={(color) => {
                      addToSavedColorsTemporary(color.hex);
                    }}
                    width="100%"
                  />
                </div>
              ) : showGradientOption && isGradient ? (
                <div>
                  <Header as="h4">Gradient Colors</Header>
                  {gradientColors.map((color, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: '15px',
                        border: '1px solid #ddd',
                        padding: '10px',
                        borderRadius: '5px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px',
                        }}
                      >
                        <strong>Color {index + 1}</strong>
                        {gradientColors.length > 2 && (
                          <Button
                            size="mini"
                            circular
                            icon="x"
                            color="red"
                            onClick={() => removeColorFromGradient(index)}
                          />
                        )}
                      </div>
                      <ChromePicker
                        color={color}
                        onChange={(pickedColor) => {
                          updateGradientColor(index, pickedColor.hex);
                        }}
                        onChangeComplete={(pickedColor) => {
                          addToSavedColorsTemporary(pickedColor.hex);
                        }}
                        width="100%"
                      />
                    </div>
                  ))}
                  <Button
                    size="small"
                    icon="plus"
                    content="Add Color"
                    onClick={addColorToGradient}
                    style={{ marginBottom: '15px', width: '100%' }}
                  />
                  <Header as="h4">Direction</Header>
                  <Dropdown
                    selection
                    value={gradientDirection}
                    onChange={(_, { value }) => setGradientDirection(value)}
                    options={gradientDirections}
                    style={{ width: '100%', marginBottom: '15px' }}
                  />
                  <Header as="h4">Preview</Header>
                  <div
                    style={{
                      width: '100%',
                      height: '50px',
                      background: `linear-gradient(${gradientDirection}, ${gradientColors.join(', ')})`,
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '15px',
                    }}
                  />
                </div>
              ) : null}
              <br />
              <div style={{ marginBottom: '15px' }}>
                <Button onClick={applyColor} color="blue" fluid>
                  Apply{' '}
                  {showGradientOption && isGradient ? 'Gradient' : 'Color'}
                </Button>
              </div>
            </div>
          </Modal.Content>
        </Modal>
      </div>
    </FormFieldWrapper>
  );
};

export default SimpleColorPicker;
