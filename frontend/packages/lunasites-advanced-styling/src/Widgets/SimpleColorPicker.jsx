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

  // Get last 5 used colors from localStorage
  const getLastUsedColors = () => {
    try {
      const saved = localStorage.getItem('volto-color-picker-last-used');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not load last used colors from localStorage:', e);
      return [];
    }
  };

  // Save color to last used colors
  const saveToLastUsed = (color) => {
    try {
      const lastUsed = getLastUsedColors();
      const filtered = lastUsed.filter(c => c !== color);
      const newLastUsed = [color, ...filtered].slice(0, 5);
      localStorage.setItem('volto-color-picker-last-used', JSON.stringify(newLastUsed));
      return newLastUsed;
    } catch (e) {
      console.warn('Could not save to last used colors:', e);
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
  const [lastUsedColors, setLastUsedColors] = React.useState(getLastUsedColors);

  // Standard colors palette
  const standardColors = [
    '#FF0000', '#FF4500', '#FFA500', '#FFFF00', '#9AFF9A', '#00FF00',
    '#00FFFF', '#0000FF', '#8A2BE2', '#FF1493', '#000000', '#808080',
    '#800000', '#FF6347', '#FFD700', '#ADFF2F', '#00FA9A', '#008000',
    '#40E0D0', '#1E90FF', '#9370DB', '#FF69B4', '#FFFFFF', '#D3D3D3'
  ];

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
    const lastUsed = getLastUsedColors();
    setCustomColors(savedColors);
    setOriginalCustomColors(savedColors);
    setCustomGradients(savedGradients);
    setOriginalCustomGradients(savedGradients);
    setLastUsedColors(lastUsed);
  }, []);

  // Get current color schema from CSS variables
  const getColorSchemaColors = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    return {
      Background:
        computedStyle.getPropertyValue('--lunasites-background-color').trim() ||
        '#ffffff',
      Primary:
        computedStyle.getPropertyValue('--lunasites-primary-color').trim() ||
        '#0070ae',
      Secondary:
        computedStyle.getPropertyValue('--lunasites-secondary-color').trim() ||
        '#e73d5c',
      Header:
        computedStyle.getPropertyValue('--lunasites-header-text-color').trim() ||
        '#2c3e50',
      Text:
        computedStyle.getPropertyValue('--lunasites-text-color').trim() ||
        '#333333',
      Accent:
        computedStyle.getPropertyValue('--lunasites-accent-color').trim() ||
        '#6bb535',
    };
  };

  const quickColors = getColorSchemaColors();

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
      <SimpleColorPickerCore
        id={id}
        value={value}
        onChange={onChange}
        showGradientOption={showGradientOption}
      />
    </FormFieldWrapper>
  );
};

const SimpleColorPickerCore = ({ id, value, onChange, showGradientOption }) => {
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

  // Get last 5 used colors from localStorage
  const getLastUsedColors = () => {
    try {
      const saved = localStorage.getItem('volto-color-picker-last-used');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not load last used colors from localStorage:', e);
      return [];
    }
  };

  // Save color to last used colors
  const saveToLastUsed = (color) => {
    try {
      const lastUsed = getLastUsedColors();
      const filtered = lastUsed.filter(c => c !== color);
      const newLastUsed = [color, ...filtered].slice(0, 5);
      localStorage.setItem('volto-color-picker-last-used', JSON.stringify(newLastUsed));
      return newLastUsed;
    } catch (e) {
      console.warn('Could not save to last used colors:', e);
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
  const [lastUsedColors, setLastUsedColors] = React.useState(getLastUsedColors);

  // Standard colors palette
  const standardColors = [
    '#FF0000', '#FF4500', '#FFA500', '#FFFF00', '#9AFF9A', '#00FF00',
    '#00FFFF', '#0000FF', '#8A2BE2', '#FF1493', '#000000', '#808080',
    '#800000', '#FF6347', '#FFD700', '#ADFF2F', '#00FA9A', '#008000',
    '#40E0D0', '#1E90FF', '#9370DB', '#FF69B4', '#FFFFFF', '#D3D3D3'
  ];

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
    const lastUsed = getLastUsedColors();
    setCustomColors(savedColors);
    setOriginalCustomColors(savedColors);
    setCustomGradients(savedGradients);
    setOriginalCustomGradients(savedGradients);
    setLastUsedColors(lastUsed);
  }, []);

  // Get current color schema from CSS variables
  const getColorSchemaColors = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    return {
      Background:
        computedStyle.getPropertyValue('--lunasites-background-color').trim() ||
        '#ffffff',
      Primary:
        computedStyle.getPropertyValue('--lunasites-primary-color').trim() ||
        '#0070ae',
      Secondary:
        computedStyle.getPropertyValue('--lunasites-secondary-color').trim() ||
        '#e73d5c',
      Header:
        computedStyle.getPropertyValue('--lunasites-header-text-color').trim() ||
        '#2c3e50',
      Text:
        computedStyle.getPropertyValue('--lunasites-text-color').trim() ||
        '#333333',
      Accent:
        computedStyle.getPropertyValue('--lunasites-accent-color').trim() ||
        '#6bb535',
    };
  };

  const quickColors = getColorSchemaColors();

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

  const handleCloseModal = (e) => {
    e.preventDefault();
    // Revert to original colors and gradients if not applied
    setCustomColors(originalCustomColors);
    setCustomGradients(originalCustomGradients);
    setShowPicker(false);
  };

  return (
    <div className="wrapper">
      <Button
        style={{
          ...(value
            ? (value.startsWith('linear-gradient') ||
              value.startsWith('radial-gradient'))
              ? { background: value }
              : { backgroundColor: value }
            : { backgroundColor: 'white' }),
          border: '2px solid #094ce1',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => {
          setShowPicker(!showPicker);
          e.preventDefault();
        }}
        size="huge"
        title="Pick color"
        width={'100%'}
      >
        {!value && (
          <Icon
            name={clearSVG}
            size="18px"
            style={{
              color: 'red',
              fontWeight: 'bold',
            }}
          />
        )}
        {value && ''}
      </Button>

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
            <Header as="h4">Site Colors</Header>
            <div className="site-colors" style={{ marginBottom: '20px' }}>
              {Object.entries(quickColors).map(([name, color]) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (isGradient) {
                      updateGradientColor(0, color);
                    } else {
                      onChange(id, color);
                      const newLastUsed = saveToLastUsed(color);
                      setLastUsedColors(newLastUsed);
                      setShowPicker(false);
                    }
                  }}
                  title={`Click to use ${name}: ${color}`}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: color,
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      marginRight: '10px',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{name}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{color}</div>
                  </div>
                </div>
              ))}
            </div>

            {lastUsedColors.length > 0 && (
              <>
                <Header as="h4">Last 5 Used Colors</Header>
                <div className="last-used-colors" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {lastUsedColors.map((color, index) => (
                      <div
                        key={index}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: color,
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onClick={() => {
                          if (isGradient) {
                            updateGradientColor(0, color);
                          } else {
                            onChange(id, color);
                            const newLastUsed = saveToLastUsed(color);
                            setLastUsedColors(newLastUsed);
                            setShowPicker(false);
                          }
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <Header as="h4">Solid Colors</Header>
            <div className="standard-colors" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {standardColors.map((color, index) => (
                  <div
                    key={index}
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: color,
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (isGradient) {
                        updateGradientColor(0, color);
                      } else {
                        onChange(id, color);
                        const newLastUsed = saveToLastUsed(color);
                        setLastUsedColors(newLastUsed);
                        setShowPicker(false);
                      }
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

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
            {showGradientOption && isGradient && customGradients.length > 0 && (
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
            )}
            {showGradientOption && isGradient ? (
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

            {!isGradient || !showGradientOption ? (
              <div>
                <Header as="h4" style={{ paddingTop: '20px' }}>
                  Color Picker
                </Header>
                <ChromePicker
                  color={value || '#000'}
                  onChange={(color) => {
                    onChange(id, color.hex);
                  }}
                  onChangeComplete={(color) => {
                    addToSavedColorsTemporary(color.hex);
                    const newLastUsed = saveToLastUsed(color.hex);
                    setLastUsedColors(newLastUsed);
                  }}
                  width="100%"
                />
              </div>
            ) : null}

            <br />
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
              <Button onClick={applyColor} color="blue" style={{ flex: 1 }}>
                Apply {showGradientOption && isGradient ? 'Gradient' : 'Color'}
              </Button>
              <Button
                onClick={() => {
                  onChange(id, '');
                  setShowPicker(false);
                }}
                basic
                color="red"
              >
                Clear
              </Button>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default SimpleColorPicker;
export { SimpleColorPickerCore };
