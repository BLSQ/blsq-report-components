import React from "react";
import BrowseDataPage from "./BrowseDataPage";
import { Route } from "react-router-dom";

const browseDataRoute = props => {
  return (
    <Route
      key="browseDataRoute"
      path="/data/:period/:type/:dataElementGroupId/:orgUnitId"
      component={routerProps => (
        <BrowseDataPage
          {...routerProps}
          currentUser={props.currentUser}
          onPeriodChange={props.onPeriodChange}
          dataElementGroups={props.dataElementGroups}
          dhis2={props.dhis2}
          {...props.config.global}
        />
      )}
    />
  );
};

export default browseDataRoute;
