import React from "react";
import ContractsPage from "./ContractsPage";
import ContractPage from "./ContractPage";
import { Route } from "react-router-dom";

const contractsRoute = (props) => {
  return [
    <Route
      key="contractsRoute"
      path="/contracts/"
      exact={true}
      component={(routerProps) => (
        <ContractsPage
          {...routerProps}
          periodFormat={props.periodFormat}
          currentUser={props.currentUser}
          dhis2={props.dhis2}
        />
      )}
    />,
    <Route
      key="contractRoute"
      path="/contracts/:orgUnitId"
      component={(routerProps) => (
        <ContractPage
          {...routerProps}
          periodFormat={props.periodFormat}
          currentUser={props.currentUser}
          dhis2={props.dhis2}
        />
      )}
    />,
  ];
};

export default contractsRoute;
