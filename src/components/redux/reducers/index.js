import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import currentUser from "./currentUser";
import load from "./load";
import drawer from "./drawer";
import period from "./period";

const index = combineReducers({
  routing: routerReducer,
  currentUser,
  load,
  drawer,
  period,
});

export default index;
