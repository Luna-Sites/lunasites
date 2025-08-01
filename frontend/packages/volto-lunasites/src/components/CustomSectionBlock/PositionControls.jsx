import React from 'react';
import PropTypes from 'prop-types';

const PositionControls = ({ 
  blockId, 
  position, 
  onUpdatePosition, 
  gridConfig,
  onClose 
}) => {
  const { columns } = gridConfig;

  const handlePositionChange = (field, value) => {
    const newPosition = {
      ...position,
      [field]: Math.max(0, parseInt(value) || 0)
    };
    
    // Ensure block fits within grid bounds
    if (field === 'x' || field === 'width') {
      newPosition.x = Math.min(newPosition.x, columns - newPosition.width);
      newPosition.width = Math.min(newPosition.width, columns - newPosition.x);
    }
    
    onUpdatePosition(blockId, newPosition);
  };

  const moveBlock = (direction) => {
    let newX = position.x;
    let newY = position.y;
    
    switch (direction) {
      case 'up':
        newY = Math.max(0, position.y - 1);
        break;
      case 'down':
        newY = position.y + 1;
        break;
      case 'left':
        newX = Math.max(0, position.x - 1);
        break;
      case 'right':
        newX = Math.min(columns - position.width, position.x + 1);
        break;
      default:
        return;
    }
    
    onUpdatePosition(blockId, { ...position, x: newX, y: newY });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Position Block</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      {/* Movement Controls */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>Move Block:</div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '4px',
          width: '120px',
          margin: '0 auto'
        }}>
          <div></div>
          <button onClick={() => moveBlock('up')} style={buttonStyle}>↑</button>
          <div></div>
          <button onClick={() => moveBlock('left')} style={buttonStyle}>←</button>
          <div style={{ 
            background: '#f0f0f0', 
            border: '1px solid #ddd',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>
            {position.x},{position.y}
          </div>
          <button onClick={() => moveBlock('right')} style={buttonStyle}>→</button>
          <div></div>
          <button onClick={() => moveBlock('down')} style={buttonStyle}>↓</button>
          <div></div>
        </div>
      </div>

      {/* Manual Position Input */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>Position:</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>X:</label>
            <input
              type="number"
              value={position.x}
              onChange={(e) => handlePositionChange('x', e.target.value)}
              style={inputStyle}
              min="0"
              max={columns - position.width}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Y:</label>
            <input
              type="number"
              value={position.y}
              onChange={(e) => handlePositionChange('y', e.target.value)}
              style={inputStyle}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Size Controls */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontWeight: '500' }}>Size:</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Width:</label>
            <input
              type="number"
              value={position.width}
              onChange={(e) => handlePositionChange('width', e.target.value)}
              style={inputStyle}
              min="1"
              max={columns - position.x}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#666' }}>Height:</label>
            <input
              type="number"
              value={position.height}
              onChange={(e) => handlePositionChange('height', e.target.value)}
              style={inputStyle}
              min="1"
            />
          </div>
        </div>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '8px', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666'
      }}>
        Grid: {columns} columns × {position.height} rows
      </div>
    </div>
  );
};

const buttonStyle = {
  background: '#f8f9fa',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const inputStyle = {
  width: '60px',
  padding: '4px 8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  textAlign: 'center'
};

PositionControls.propTypes = {
  blockId: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  onUpdatePosition: PropTypes.func.isRequired,
  gridConfig: PropTypes.shape({
    columns: PropTypes.number.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PositionControls;