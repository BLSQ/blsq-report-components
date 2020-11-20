import { SET_IS_OPEN_DRAWER } from "../actions/drawer";

const initialState = {
  isOpen: false,
};

const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_IS_OPEN_DRAWER: {
      const isOpen = action.payload;
      return { ...state, isOpen };
    }

    default:
      return state;
  }
};

export default reducer;
