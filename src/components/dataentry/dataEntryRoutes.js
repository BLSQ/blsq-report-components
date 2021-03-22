import React from "react";
import { Route } from "react-router-dom";
import { syncsRoutes } from "../syncs/routes";

import DataEntrySelectionPage from "./DataEntrySelectionPage";

const dataEntryRoutes = (props) => {
  return [
    <Route
      key="dataEntryRoute"
      path="/dataentry/:orgUnitId/:period/:dataEntryCode"
      exact
      component={(routerProps) => {
        return (
          <DataEntrySelectionPage
            currentUser={props.currentUser}
            dhis2={props.dhis2}
            {...routerProps}
            {...props.config.global}
          />
        );
      }}
    />,

    <Route
      key="dataEntrySelectionPeriodRoute"
      path="/dataentry/:orgUnitId/:period"
      exact
      component={(routerProps) => {
        return (
          <DataEntrySelectionPage
            currentUser={props.currentUser}
            dhis2={props.dhis2}
            {...routerProps}
            {...props.config.global}
          />
        );
      }}
    />,

    ...syncsRoutes(props),
  ];
};

export default dataEntryRoutes;
