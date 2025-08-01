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
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragPreview, setDragPreview] = React.useState(null);
  const dragStartPos = React.useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Allow dragging from anywhere on the block if selected, or from drag handle
    const isDragHandle = e.target.closest('.drag-handle');
    const isBlockSelected = selected;
    
    // Always allow drag from drag handle, or from anywhere if block is selected
    if (!isDragHandle && !isBlockSelected) {
      // If block is not selected, select it first but don't start drag
      if (onSelect) {
        onSelect(blockId);
      }
      return;
    }
    
    // Start drag immediately if drag handle is used or block is selected
    if (!isDragHandle && !isBlockSelected) {
      return; // Safety check
    }

    e.preventDefault();
    e.stopPropagation();
    
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // Store initial mouse position relative to element
    dragStartPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setIsDragging(true);
    element.setAttribute('data-block-id', blockId);
    element.setAttribute('data-position', JSON.stringify(position));
    
    if (onStartDrag) {
      onStartDrag(blockId);
    }

    // Create drag preview
    const preview = element.cloneNode(true);
    preview.style.position = 'fixed';
    preview.style.pointerEvents = 'none';
    preview.style.zIndex = '10000';
    preview.style.width = rect.width + 'px';
    preview.style.height = rect.height + 'px';
    preview.style.opacity = '0.8';
    preview.style.transform = 'rotate(3deg)';
    preview.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    preview.style.borderRadius = '8px';
    preview.classList.add('drag-preview');
    
    document.body.appendChild(preview);
    setDragPreview(preview);

    const handleMouseMove = (moveEvent) => {
      if (preview) {
        preview.style.left = (moveEvent.clientX - dragStartPos.current.x) + 'px';
        preview.style.top = (moveEvent.clientY - dragStartPos.current.y) + 'px';
      }
    };

    const handleMouseUp = (upEvent) => {
      setIsDragging(false);
      
      if (preview && preview.parentNode) {
        document.body.removeChild(preview);
      }
      setDragPreview(null);
      
      // Find the drop target under the mouse
      const dropTarget = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const gridLayer = dropTarget?.closest('.grid-drag-layer');
      
      if (gridLayer && gridLayer.onMouseUp) {
        gridLayer.onMouseUp(upEvent);
      } else {
        // Manually trigger drop calculation
        const event = new MouseEvent('mouseup', {
          clientX: upEvent.clientX,
          clientY: upEvent.clientY,
          bubbles: true
        });
        gridLayer?.dispatchEvent(event);
      }
      
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
      className={`draggable-grid-block ${selected ? 'selected' : ''} ${isDragging ? 'being-dragged' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      data-block-id={blockId}
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: isDragging ? 'grabbing' : (selected ? 'grab' : 'pointer'),
        position: 'relative',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        opacity: isDragging ? 0.3 : 1,
        userSelect: 'none'
      }}
    >
      {/* Drag Handle */}
      <div 
        className="drag-handle"
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '24px',
          height: '24px',
          background: isDragging ? 'rgba(0, 123, 193, 1)' : 'rgba(0, 123, 193, 0.9)',
          borderRadius: '4px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: 'white',
          opacity: selected ? 1 : 0.7,
          transition: 'all 0.2s ease',
          zIndex: 10,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
        title="Drag to move"
        onMouseDown={(e) => {
          e.stopPropagation();
          // Force the mousedown to trigger on the parent
          const parentElement = e.currentTarget.parentElement;
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: e.clientX,
            clientY: e.clientY,
            bubbles: true,
            cancelable: true
          });
          parentElement.dispatchEvent(mouseEvent);
        }}
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