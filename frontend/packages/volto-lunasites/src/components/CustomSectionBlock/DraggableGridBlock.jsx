import React from 'react';
import PropTypes from 'prop-types';

const DraggableGridBlock = ({ 
  blockId, 
  position, 
  children, 
  selected,
  onSelect,
  onStartDrag,
  onEndDrag
}) => {
  const handleMouseDown = (e) => {
    // Only allow dragging from the drag handle or when block is selected
    const isDragHandle = e.target.closest('.drag-handle');
    const isBlockSelected = selected;
    
    if (!isDragHandle && !isBlockSelected) {
      return;
    }

    e.preventDefault();
    
    const element = e.currentTarget;
    element.classList.add('dragging');
    element.setAttribute('data-block-id', blockId);
    element.setAttribute('data-position', JSON.stringify(position));
    
    if (onStartDrag) {
      onStartDrag(blockId);
    }

    const handleMouseMove = (moveEvent) => {
      // Update element position to follow mouse
      const rect = element.parentElement.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;
      
      element.style.transform = `translate(${x - element.offsetWidth/2}px, ${y - element.offsetHeight/2}px)`;
      element.style.zIndex = '1000';
      element.style.pointerEvents = 'none';
    };

    const handleMouseUp = () => {
      element.classList.remove('dragging');
      element.style.transform = '';
      element.style.zIndex = '';
      element.style.pointerEvents = '';
      
      if (onEndDrag) {
        onEndDrag(blockId);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(blockId);
    }
  };

  return (
    <div 
      className={`draggable-grid-block ${selected ? 'selected' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      data-block-id={blockId}
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: selected ? 'grab' : 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Drag Handle */}
      <div 
        className="drag-handle"
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '20px',
          height: '20px',
          background: 'rgba(0, 123, 193, 0.8)',
          borderRadius: '4px',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'white',
          opacity: selected ? 1 : 0,
          transition: 'opacity 0.2s ease',
          zIndex: 10
        }}
        title="Drag to move"
        onMouseDown={(e) => e.stopPropagation()} // Ensure drag handle gets the event
      >
        ⋮⋮
      </div>

      {/* Block Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>

      {/* Position Info (Debug) */}
      {selected && (
        <div 
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '4px',
            fontSize: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            pointerEvents: 'none'
          }}
        >
          {position.x},{position.y} ({position.width}×{position.height})
        </div>
      )}
    </div>
  );
};

DraggableGridBlock.propTypes = {
  blockId: PropTypes.string.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  onStartDrag: PropTypes.func,
  onEndDrag: PropTypes.func,
};

DraggableGridBlock.defaultProps = {
  selected: false,
  onSelect: () => {},
  onStartDrag: () => {},
  onEndDrag: () => {},
};

export default DraggableGridBlock;