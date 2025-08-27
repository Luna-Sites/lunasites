/**
 * Luna Theming reducer.
 * @module reducers/lunaTheming
 */

const initialState = {
  get: {
    loading: false,
    loaded: false,
    error: null,
  },
  set: {
    loading: false,
    loaded: false,
    error: null,
  },
  data: {
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
};

/**
 * Luna Theming reducer.
 * @function lunaTheming
 * @param {Object} state Current state.
 * @param {Object} action Action to be performed.
 * @returns {Object} New state.
 */
export default function lunaTheming(state = initialState, action = {}) {
  switch (action.type) {
    case 'GET_LUNA_THEMING_PENDING':
      return {
        ...state,
        get: {
          loading: true,
          loaded: false,
          error: null,
        },
      };
    case 'GET_LUNA_THEMING_SUCCESS':
      return {
        ...state,
        get: {
          loading: false,
          loaded: true,
          error: null,
        },
        data: action.result.luna_theming || state.data,
      };
    case 'GET_LUNA_THEMING_FAIL':
      return {
        ...state,
        get: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    case 'SET_LUNA_THEMING_PENDING':
    case 'APPLY_LUNA_THEMING_PRESET_PENDING':
    case 'CLEAR_LUNA_THEMING_PENDING':
      return {
        ...state,
        set: {
          loading: true,
          loaded: false,
          error: null,
        },
      };
    case 'SET_LUNA_THEMING_SUCCESS':
    case 'APPLY_LUNA_THEMING_PRESET_SUCCESS':
    case 'CLEAR_LUNA_THEMING_SUCCESS':
      return {
        ...state,
        set: {
          loading: false,
          loaded: true,
          error: null,
        },
        data: action.result.luna_theming || state.data,
      };
    case 'SET_LUNA_THEMING_FAIL':
    case 'APPLY_LUNA_THEMING_PRESET_FAIL':
    case 'CLEAR_LUNA_THEMING_FAIL':
      return {
        ...state,
        set: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}