import React from "react";
import ContractsPage from "./ContractsPage";
import { Route } from "react-router-dom";

const contractsRoute = props => {
  return (
    <Route
      key="contractsRoute"
      path="/contracts/"
      component={routerProps => (
        <ContractsPage
          {...routerProps}
          periodFormat={props.periodFormat}
          currentUser={props.currentUser}
          dhis2={props.dhis2}
       />
      )}
    />
  );
};

export default contractsRoute;
