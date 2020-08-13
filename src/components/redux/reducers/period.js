import DatePeriods from "../../../support/DatePeriods";

import { SET_CURRENT_PERIOD } from "../actions/period";

const initialState = {
  current: DatePeriods.currentQuarter(),
};

const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case SET_CURRENT_PERIOD: {
      const current = action.payload;
      return { ...state, current };
    }

    default:
      return state;
  }
};

export default reducer;
