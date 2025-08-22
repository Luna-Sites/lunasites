/**
 * Content Property Calculator
 * 
 * Calculates appropriate block content properties based on container dimensions.
 * This enables true Squarespace-style resizing where both container and content scale together.
 */

/**
 * Calculate content properties for different block types based on container size
 * @param {string} blockType - The Volto block type (text, image, button, etc.)
 * @param {Object} containerSize - Container dimensions {width, height}
 * @param {Object} currentData - Current block data for reference
 * @returns {Object} - Updated content properties
 */
export const calculateContentProperties = (blockType, containerSize, currentData = {}) => {
  const { width, height } = containerSize;
  
  switch (blockType) {
    case 'text':
    case 'slate':
      return calculateTextProperties(width, height, currentData);
    
    case 'image':
      return calculateImageProperties(width, height, currentData);
    
    case 'button':
      return calculateButtonProperties(width, height, currentData);
    
    case 'video':
      return calculateVideoProperties(width, height, currentData);
    
    default:
      return {};
  }
};

/**
 * Calculate text/slate block properties
 */
const calculateTextProperties = (width, height, currentData) => {
  // Scale font size based on container width
  // Typical range: 12px to 48px
  const baseFontSize = Math.max(12, Math.min(48, width / 15));
  
  // Adjust line height based on container height
  const lineHeight = Math.max(1.2, Math.min(2.0, height / (baseFontSize * 3)));
  
  return {
    fontSize: Math.round(baseFontSize),
    lineHeight: Math.round(lineHeight * 10) / 10, // Round to 1 decimal
  };
};

/**
 * Calculate image block properties
 */
const calculateImageProperties = (width, height, currentData) => {
  // Leave some padding around the image
  const padding = 10;
  const imageWidth = Math.max(50, width - padding * 2);
  const imageHeight = Math.max(40, height - padding * 2);
  
  return {
    imageWidth: imageWidth,
    imageHeight: imageHeight,
    // Maintain aspect ratio option
    maintainAspectRatio: currentData.maintainAspectRatio ?? true,
  };
};

/**
 * Calculate button block properties  
 */
const calculateButtonProperties = (width, height, currentData) => {
  // Calculate scale ratio based on container dimensions
  const widthRatio = width / 200; // Base width of 200px
  const heightRatio = height / 50; // Base height of 50px
  const scaleRatio = Math.min(widthRatio, heightRatio);
  
  // Font size scales between 10px and 32px based on container size
  const fontSize = Math.max(10, Math.min(32, 16 * scaleRatio));
  
  // Padding scales proportionally but less aggressively
  const padding = Math.max(4, Math.min(20, 12 * Math.sqrt(scaleRatio)));
  
  // Button width matches container width
  const buttonWidth = width;
  
  return {
    buttonWidth: buttonWidth,
    padding: Math.round(padding),
    fontSize: Math.round(fontSize),
  };
};

/**
 * Calculate video block properties
 */
const calculateVideoProperties = (width, height, currentData) => {
  // Video should fill the container with aspect ratio consideration
  const videoWidth = Math.max(200, width - 10);
  const videoHeight = Math.max(150, height - 10);
  
  return {
    videoWidth: videoWidth,
    videoHeight: videoHeight,
    aspectRatio: currentData.aspectRatio || '16:9',
  };
};

/**
 * Get default container size for a block type
 * @param {string} blockType - The Volto block type
 * @returns {Object} - Default container dimensions {width, height}
 */
export const getDefaultContainerSize = (blockType) => {
  switch (blockType) {
    case 'text':
    case 'slate':
      return { width: 300, height: 120 };
    
    case 'image':
      return { width: 250, height: 200 };
    
    case 'button':
      return { width: 180, height: 60 };
    
    case 'video':
      return { width: 400, height: 225 }; // 16:9 aspect ratio
    
    default:
      return { width: 200, height: 150 };
  }
};

/**
 * Initialize block with container size and content properties
 * @param {Object} blockData - Original block data
 * @returns {Object} - Block data with size and content properties
 */
export const initializeBlockSizing = (blockData) => {
  const blockType = blockData['@type'];
  
  // Get default container size if not specified
  const containerSize = blockData.containerSize || getDefaultContainerSize(blockType);
  
  // Calculate initial content properties
  const contentProperties = calculateContentProperties(blockType, containerSize, blockData);
  
  return {
    ...blockData,
    containerSize,
    ...contentProperties,
  };
};

/**
 * Update block with unified resizing (container + content)
 * @param {Object} blockData - Current block data
 * @param {Object} newContainerSize - New container dimensions
 * @returns {Object} - Updated block data with new size and content properties
 */
export const unifiedBlockResize = (blockData, newContainerSize) => {
  const blockType = blockData['@type'];
  
  // Calculate new content properties based on new container size
  const contentProperties = calculateContentProperties(blockType, newContainerSize, blockData);
  
  return {
    ...blockData,
    containerSize: newContainerSize,
    ...contentProperties,
  };
};