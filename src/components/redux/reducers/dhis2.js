import { SET_DHIS2 } from "../actions/dhis2";

const initialState = {
  support: null,
};

const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_DHIS2: {
      const support = action.payload;
      return { ...state, support };
    }

    default:
      return state;
  }
};

export default reducer;
