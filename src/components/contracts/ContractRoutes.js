import React from "react";
import ContractsPage from "./ContractsPage";
import ContractPage from "./ContractPage";
import Wizard from "./wizard/Wizard";
import { Route } from "react-router-dom";

const contractsRoute = (props) => {
  return [
    <Route
      key="contractsRoute"
      path="/contracts/"
      exact={true}
      render={(routerProps) => {
        return (
          <ContractsPage
            {...routerProps}
            periodFormat={props.periodFormat}
            currentUser={props.currentUser}
            dhis2={props.dhis2}
          />
        );
      }}
    />,
    <Route
      key="contractImportRoute"
      exact={true}
      path="/contracts/import"
      render={(routerProps) => (
        <Wizard
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
      render={(routerProps) => {
        //TODO find a better way
        if (routerProps.match.params.orgUnitId == "import") {
          return null;
        }
        return (
          <ContractPage
            {...routerProps}
            periodFormat={props.periodFormat}
            currentUser={props.currentUser}
            dhis2={props.dhis2}
          />
        );
      }}
    />,
  ];
};

export default contractsRoute;
