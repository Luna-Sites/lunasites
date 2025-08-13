import { GET_COLOR_SCHEMA_INHERIT, GET_DESIGN_SITE } from '../constants';

const initialState = {
  error: null,
  loaded: false,
  loading: false,
  data: null,
};

export default function designSchema(state = initialState, action = {}) {
  switch (action.type) {
    case `${GET_COLOR_SCHEMA_INHERIT}_PENDING`:
    case `${GET_DESIGN_SITE}_PENDING`:
      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
      };
    case `${GET_COLOR_SCHEMA_INHERIT}_SUCCESS`:
    case `${GET_DESIGN_SITE}_SUCCESS`:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        data: action.result,
      };
    case `${GET_COLOR_SCHEMA_INHERIT}_FAIL`:
    case `${GET_DESIGN_SITE}_FAIL`:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
      };
    default:
      return state;
  }
}