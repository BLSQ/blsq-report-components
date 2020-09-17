import { createStore, applyMiddleware } from "redux";
import { syncHistoryWithStore } from "react-router-redux";
import { createBrowserHistory } from "history";
import thunkMiddleware from "redux-thunk";
import rootReducer from "./reducers/index";

export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

export const history = syncHistoryWithStore(createBrowserHistory(), store);
