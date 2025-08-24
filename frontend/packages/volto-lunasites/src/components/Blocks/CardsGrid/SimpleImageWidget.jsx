import React, { useState } from 'react';
import { Button, Input } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import uploadSVG from '@plone/volto/icons/upload.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import { readAsDataURL } from 'promise-file-reader';

const SimpleImageWidget = ({ id, value, onChange, placeholder }) => {
  const [imageUrl, setImageUrl] = useState(value || '');
  const fileInputRef = React.useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const dataUrl = await readAsDataURL(file);
      setImageUrl(dataUrl);
      onChange(id, dataUrl);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    onChange(id, url);
  };

  const handleClear = () => {
    setImageUrl('');
    onChange(id, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="simple-image-widget">
      {imageUrl && (
        <div style={{ marginBottom: '10px', position: 'relative' }}>
          <img 
            src={imageUrl} 
            alt="Preview" 
            style={{ 
              maxWidth: '200px', 
              maxHeight: '150px', 
              objectFit: 'cover',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }} 
          />
          <Button 
            icon 
            basic 
            onClick={handleClear}
            style={{ position: 'absolute', top: '5px', right: '5px' }}
          >
            <Icon name={clearSVG} size="20px" />
          </Button>
        </div>
      )}
      
      <Input
        fluid
        placeholder={placeholder || "Enter image URL or upload below"}
        value={imageUrl}
        onChange={handleUrlChange}
        style={{ marginBottom: '10px' }}
      />
      
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id={`file-upload-${id}`}
        />
        <Button
          as="label"
          htmlFor={`file-upload-${id}`}
          icon
          labelPosition="left"
          primary
        >
          <Icon name={uploadSVG} />
          Upload Image
        </Button>
      </div>
    </div>
  );
};

export default SimpleImageWidget;