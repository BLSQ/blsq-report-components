import React from "react";

import { Route } from "react-router-dom";
import CompletenessView from "./CompletenessView";

export const completenessRoutes = (props) => {
  return [
    <Route
      key="CompletenessView"
      exact
      path="/completeness/:period"
      render={(routerProps) => {
        return <CompletenessView {...routerProps} {...props}></CompletenessView>;
      }}
    />,
  ];
};
