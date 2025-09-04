import React from 'react';
import { HexColorPicker } from 'react-colorful';

const ModernColorPicker = ({ field, currentColor, onColorChange, onClose }) => {
  const [color, setColor] = React.useState(currentColor || '#ffffff');
  const [position, setPosition] = React.useState({ top: '100%', left: '0', right: 'auto' });
  const pickerRef = React.useRef(null);

  // Calculate smart positioning
  React.useEffect(() => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const pickerWidth = 250; // Approximate width including padding
      const pickerHeight = 400; // Approximate height

      let newPosition = { top: '100%', left: '0', right: 'auto' };

      // Check if picker would overflow on the right
      if (rect.left + pickerWidth > viewportWidth) {
        newPosition.left = 'auto';
        newPosition.right = '0';
      }

      // Check if picker would overflow on the bottom
      if (rect.bottom + pickerHeight > viewportHeight) {
        // Only move to top if there's enough space above
        if (rect.top - pickerHeight > 0) {
          newPosition.top = 'auto';
          newPosition.bottom = '100%';
        }
        // Otherwise keep it below but adjust viewport scrolling if needed
      }

      setPosition(newPosition);
    }
  }, []);

  React.useEffect(() => {
    if (currentColor) {
      // Extract hex from rgba or use as is
      if (currentColor.startsWith('rgba')) {
        const rgbaMatch = currentColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbaMatch) {
          const [, r, g, b] = rgbaMatch;
          const hexFromRgba =
            '#' +
            [r, g, b]
              .map((x) => {
                const hex = parseInt(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
              })
              .join('');
          setColor(hexFromRgba);
        }
      } else {
        setColor(currentColor);
      }
    }
  }, [currentColor]);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    onColorChange(field.key, newColor);
  };

  const handleHexInputChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith('#') && value.length > 0) {
      value = '#' + value;
    }
    if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
      setColor(value);
      if (value.length === 7) {
        onColorChange(field.key, value);
      }
    }
  };

  const handleHexInputBlur = (e) => {
    let value = e.target.value;
    if (!value.startsWith('#') && value.length > 0) {
      value = '#' + value;
    }
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      onColorChange(field.key, value);
    } else if (value.length > 0) {
      // Reset to current color if invalid
      setColor(currentColor || '#ffffff');
    }
  };

  return (
    <div
      ref={pickerRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        right: position.right,
        bottom: position.bottom,
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 12px 28px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '200px',
        marginTop: position.top === '100%' ? '8px' : '0',
        marginBottom: position.bottom === '100%' ? '8px' : '0',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '12px',
          fontWeight: '600',
          fontSize: '14px',
          color: '#1f2937',
          textAlign: 'center',
        }}
      >
        {field.label}
      </div>

      {/* React Colorful HexColorPicker */}
      <div style={{ marginBottom: '16px' }}>
        <HexColorPicker color={color} onChange={handleColorChange} />
      </div>

      {/* Hex Input */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            fontSize: '12px',
            color: '#6b7280',
            display: 'block',
            marginBottom: '4px',
          }}
        >
          Hex Color
        </label>
        <input
          type="text"
          value={color.toUpperCase()}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          placeholder="#FFFFFF"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontFamily: 'SFMono-Regular, Consolas, monospace',
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            letterSpacing: '0.025em',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = '#d1d5db';
          }}
        />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          color: '#374151',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f3f4f6';
          e.target.style.borderColor = '#9ca3af';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#f9fafb';
          e.target.style.borderColor = '#d1d5db';
        }}
      >
        Close
      </button>
    </div>
  );
};

export default ModernColorPicker;