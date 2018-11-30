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
          currentUser={props.currentUser}
          onPeriodChange={props.onPeriodChange}
          incentivesDescriptors={props.incentivesDescriptors}
        />
      )}
    />
  );
};


export default incentiveRoute;
