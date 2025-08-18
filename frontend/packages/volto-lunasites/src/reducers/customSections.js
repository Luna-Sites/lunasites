/**
 * Custom sections reducer.
 * @module reducers/customSections
 */

import {
  SAVE_CUSTOM_SECTION,
  GET_CUSTOM_SECTIONS,
  DELETE_CUSTOM_SECTION,
} from '../actions/customSections';

const initialState = {
  error: null,
  loaded: false,
  loading: false,
  items: [],
  save: {
    error: null,
    loaded: false,
    loading: false,
  },
  delete: {
    error: null,
    loaded: false,
    loading: false,
  },
};

/**
 * Custom sections reducer.
 * @function customSections
 * @param {Object} state Current state.
 * @param {Object} action Action to be handled.
 * @returns {Object} New state.
 */
export default function customSections(state = initialState, action = {}) {
  switch (action.type) {
    case `${GET_CUSTOM_SECTIONS}_PENDING`:
      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
      };
    case `${GET_CUSTOM_SECTIONS}_SUCCESS`:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        items: action.result.sections || [],
      };
    case `${GET_CUSTOM_SECTIONS}_FAIL`:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
        items: [],
      };
    case `${SAVE_CUSTOM_SECTION}_PENDING`:
      return {
        ...state,
        save: {
          error: null,
          loaded: false,
          loading: true,
        },
      };
    case `${SAVE_CUSTOM_SECTION}_SUCCESS`:
      return {
        ...state,
        save: {
          error: null,
          loaded: true,
          loading: false,
        },
        // Add the new section to the items list
        items: [...state.items, action.result],
      };
    case `${SAVE_CUSTOM_SECTION}_FAIL`:
      return {
        ...state,
        save: {
          error: action.error,
          loaded: false,
          loading: false,
        },
      };
    case `${DELETE_CUSTOM_SECTION}_PENDING`:
      return {
        ...state,
        delete: {
          error: null,
          loaded: false,
          loading: true,
        },
      };
    case `${DELETE_CUSTOM_SECTION}_SUCCESS`:
      return {
        ...state,
        delete: {
          error: null,
          loaded: true,
          loading: false,
        },
        // Remove the deleted section from items
        items: state.items.filter(item => item.id !== action.result.id),
      };
    case `${DELETE_CUSTOM_SECTION}_FAIL`:
      return {
        ...state,
        delete: {
          error: action.error,
          loaded: false,
          loading: false,
        },
      };
    default:
      return state;
  }
}