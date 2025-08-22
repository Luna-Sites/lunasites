import {
  serializeNodes,
  serializeNodesToText,
} from '@plone/volto-slate/editor/render';
import config from '@plone/volto/registry';
import isEqual from 'lodash/isEqual';
import Slugger from 'github-slugger';
import { normalizeString } from '@plone/volto/helpers/Utils/Utils';

const TextBlockView = (props) => {
  const { id, data, styling = {} } = props;
  const { value, override_toc } = data;
  const metadata = props.metadata || props.properties;
  const { topLevelTargetElements } = config.settings.slate;

  // Apply unified resize properties for text
  const containerSize = data.containerSize;
  const fontSize = data.fontSize;
  const lineHeight = data.lineHeight;

  // Create dynamic styles for the text
  const textStyles = {
    ...styling,
    // Use container size for scaling if available
    ...(containerSize && {
      fontSize: `${Math.max(12, Math.min(48, containerSize.width / 15))}px`,
      lineHeight: Math.max(1.2, Math.min(2.0, containerSize.height / (containerSize.width / 15 * 3))),
    }),
    // Use individual properties if available
    ...(fontSize && { fontSize: `${fontSize}px` }),
    ...(lineHeight && { lineHeight }),
  };

  const getAttributes = (node, path) => {
    const res = { ...textStyles };
    if (node.type && isEqual(path, [0])) {
      if (topLevelTargetElements.includes(node.type) || override_toc) {
        const text = serializeNodesToText(node?.children || []);
        const slug = Slugger.slug(normalizeString(text));
        res.id = slug || id;
      }
    }
    return res;
  };

  return serializeNodes(value, getAttributes, { metadata: metadata });
};

export default TextBlockView;