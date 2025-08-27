/**
 * Luna Theming actions.
 * @module actions/lunaTheming
 */

/**
 * Get Luna Theming configuration.
 * @function getLunaTheming
 * @returns {Object} Get Luna Theming action.
 */
export function getLunaTheming() {
  return {
    type: 'GET_LUNA_THEMING',
    request: {
      op: 'get',
      path: '/@luna-theming',
    },
  };
}

/**
 * Set Luna Theming configuration.
 * @function setLunaTheming
 * @param {Object} data Luna Theming data.
 * @returns {Object} Set Luna Theming action.
 */
export function setLunaTheming(data) {
  return {
    type: 'SET_LUNA_THEMING',
    request: {
      op: 'post',
      path: '/@luna-theming',
      data: { luna_theming: data },
    },
  };
}

/**
 * Apply Luna Theming preset.
 * @function applyLunaThemingPreset
 * @param {Object} preset Preset data.
 * @returns {Object} Apply preset action.
 */
export function applyLunaThemingPreset(preset) {
  return {
    type: 'APPLY_LUNA_THEMING_PRESET',
    request: {
      op: 'post',
      path: '/@luna-theming',
      data: { luna_theming: preset },
    },
  };
}

/**
 * Clear Luna Theming configuration.
 * @function clearLunaTheming
 * @returns {Object} Clear Luna Theming action.
 */
export function clearLunaTheming() {
  return {
    type: 'CLEAR_LUNA_THEMING',
    request: {
      op: 'post',
      path: '/@luna-theming',
      data: {
        luna_theming: {
          colors: {
            background_color: '#ffffff',
            neutral_color: '#222222',
            primary_color: '#094ce1',
            secondary_color: '#e73d5c',
            tertiary_color: '#6bb535',
          },
          fonts: {
            primary_font: 'Inter',
            secondary_font: 'Helvetica',
            font_sizes: {
              small: '14px',
              medium: '16px',
              large: '18px',
              xl: '24px',
              xxl: '32px',
            },
          },
          buttons: {
            border_radius: '6px',
            padding: '8px 16px',
            font_weight: '500',
            transition: 'all 0.15s ease',
          },
        },
      },
    },
  };
}