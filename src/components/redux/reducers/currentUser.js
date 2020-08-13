import { SET_CURRENT_USER } from "../actions/currentUser";

const initialState = {
  profile: undefined,
};

const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_CURRENT_USER: {
      const profile = action.payload;
      return { ...state, profile };
    }

    default:
      return state;
  }
};

export default reducer;
