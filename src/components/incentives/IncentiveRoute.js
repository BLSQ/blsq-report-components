import React from "react";
import IncentivePage from "./IncentivePage";
import { Route } from "react-router-dom";

const incentiveRoute = props => {
  return (
    <Route
      key="incentiveRoute"
      path="/incentives/:period/:incentiveCode"
      component={routerProps => (
        <IncentivePage
          {...routerProps}
          periodFormat={props.periodFormat}
          currentUser={props.currentUser}
          onPeriodChange={props.onPeriodChange}
          dhis2={props.dhis2}
          {...props.config.global}
          {...props}
        />
      )}
    />
  );
};

export default incentiveRoute;
