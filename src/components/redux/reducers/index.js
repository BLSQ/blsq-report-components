import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";

const index = combineReducers({
  routing: routerReducer,
});

export default index;
