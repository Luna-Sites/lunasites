import React from 'react';
import { Card, Header } from 'semantic-ui-react';

const ColorTestDemo = () => {
  const [colors, setColors] = React.useState({});

  React.useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);

      setColors({
        background: style
          .getPropertyValue('--lunasites-background-color')
          .trim(),
        primary: style.getPropertyValue('--lunasites-primary-color').trim(),
        secondary: style.getPropertyValue('--lunasites-secondary-color').trim(),
        tertiary: style.getPropertyValue('--lunasites-tertiary-color').trim(),
        neutral: style.getPropertyValue('--lunasites-neutral-color').trim(),
        text: style.getPropertyValue('--lunasites-text-color').trim(),
        // Legacy support
        header: style.getPropertyValue('--lunasites-header-text-color').trim(),
        accent: style.getPropertyValue('--lunasites-accent-color').trim(),
      });
    };

    // Update initially
    updateColors();

    // Listen for color changes
    window.addEventListener('colorSchemaApplied', updateColors);
    window.addEventListener('lunaThemingApplied', updateColors);

    return () => {
      window.removeEventListener('colorSchemaApplied', updateColors);
      window.removeEventListener('lunaThemingApplied', updateColors);
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Header as="h2">Color Schema Test</Header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {Object.entries(colors).map(([name, color]) => (
          <Card
            key={name}
            style={{
              backgroundColor: color,
              padding: '10px',
              minHeight: '80px',
            }}
          >
            <div
              style={{
                color: name === 'background' ? '#333' : 'white',
                textShadow:
                  name === 'background'
                    ? 'none'
                    : '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              <strong>{name.charAt(0).toUpperCase() + name.slice(1)}</strong>
              <br />
              <small>{color || 'not set'}</small>
            </div>
          </Card>
        ))}
      </div>

      <div
        style={{
          backgroundColor: 'var(--lunasites-background-color)',
          color: 'var(--lunasites-text-color)',
          padding: '20px',
          border: '2px solid var(--lunasites-primary-color)',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{
            color: 'var(--lunasites-header-text-color)',
            margin: '0 0 10px 0',
          }}
        >
          Live CSS Variables Test
        </h3>
        <p style={{ margin: '0 0 10px 0' }}>
          This section uses CSS variables directly and should update when you
          change colors.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              backgroundColor: 'var(--lunasites-primary-color)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Primary Button
          </button>
          <button
            style={{
              backgroundColor: 'var(--lunasites-secondary-color)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Secondary Button
          </button>
          <button
            style={{
              backgroundColor: 'var(--lunasites-accent-color)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Accent Button
          </button>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <strong>Instructions:</strong> Go to any page edit mode, look for "Color
        Schema" in the sidebar, and change colors to see this demo update in
        real-time.
      </div>
    </div>
  );
};

export default ColorTestDemo;
