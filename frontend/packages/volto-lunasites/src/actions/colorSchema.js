import { flattenToAppURL } from '@plone/volto/helpers';
import {
  GET_COLOR_SCHEMA_INHERIT,
  GET_INHERIT,
  GET_DESIGN_SITE,
} from '../constants';

export const getColorSchemaInherit = (url = '') => {
  let cleanedUrl = typeof url === 'string' ? url : '';

  if (
    cleanedUrl &&
    typeof cleanedUrl === 'string' &&
    cleanedUrl.endsWith('/edit')
  ) {
    cleanedUrl = cleanedUrl.slice(0, -'/edit'.length);
  }

  const apiPath = flattenToAppURL(cleanedUrl);

  return {
    type: GET_COLOR_SCHEMA_INHERIT,
    request: {
      op: 'get',
      path: `${apiPath}/@design-schema-inherit?expand.inherit.behaviors=lunasites.behaviors.design_schema.IDesignSchema`,
    },
  };
};

export const getInherit = (url = '', behaviors = []) => {
  let cleanedUrl = typeof url === 'string' ? url : '';

  if (
    cleanedUrl &&
    typeof cleanedUrl === 'string' &&
    cleanedUrl.endsWith('/edit')
  ) {
    cleanedUrl = cleanedUrl.slice(0, -'/edit'.length);
  }

  const apiPath = flattenToAppURL(cleanedUrl);

  const queryParams =
    behaviors.length > 0
      ? `?${behaviors.map((behavior) => `expand.inherit.behaviors=${behavior}`).join('&')}`
      : '';

  return {
    type: GET_INHERIT,
    request: {
      op: 'get',
      path: `${apiPath}/@design-schema-inherit${queryParams}`,
    },
  };
};

export const getDesignSite = (url = '') => {
  let cleanedUrl = typeof url === 'string' ? url : '';

  if (
    cleanedUrl &&
    typeof cleanedUrl === 'string' &&
    cleanedUrl.endsWith('/edit')
  ) {
    cleanedUrl = cleanedUrl.slice(0, -'/edit'.length);
  }

  const apiPath = flattenToAppURL(cleanedUrl);

  return {
    type: GET_DESIGN_SITE,
    request: {
      op: 'get',
      path: `${apiPath}/@design-schema-inherit?expand.inherit.behaviors=lunasites.behaviors.design_schema.IDesignSchema`,
    },
  };
};
