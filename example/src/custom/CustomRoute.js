import React from "react";
import CustomPage from "./CustomPage";
import { Route } from "react-router-dom";

const customRoute = props => {
  return (
    <Route
      key="custom-1"
      path="/custom/:period/:custom"
      component={routerProps => {
        return (
          <CustomPage
            {...routerProps}
            currentUser={props.currentUser}
            onPeriodChange={props.onPeriodChange}
            period={routerProps.match.params.period}
            custom={routerProps.match.params.period}
          />
        );
      }}
    />
  );
};

export default customRoute;
