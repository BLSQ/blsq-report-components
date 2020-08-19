import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import currentUser from "./currentUser";
import load from "./load";
import drawer from "./drawer";
import period from "./period";
import dhis2 from "./dhis2";
import snackBar from "./snackBar";

const index = combineReducers({
  routing: routerReducer,
  currentUser,
  load,
  drawer,
  period,
  dhis2,
  snackBar,
});

export default index;
