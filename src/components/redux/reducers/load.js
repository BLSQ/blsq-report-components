import { SET_IS_LOADING } from "../actions/load";

const initialState = {
  isLoading: true,
};

const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_IS_LOADING: {
      const isLoading = action.payload;
      return { ...state, isLoading };
    }

    default:
      return state;
  }
};

export default reducer;
