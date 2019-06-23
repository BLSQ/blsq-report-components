import React from "react";
import { Route } from "react-router-dom";
import OrganisationUnitsContainer from "./OrganisationUnitsContainer";
import EditOrgUnitContainer from "./EditOrgUnitContainer";

const pyramidRoute = props => {
  return [
    <Route
      key="pyramidRoute"
      path="/pyramid"
      exact
      component={routerProps => {
        return <OrganisationUnitsContainer {...routerProps} {...props} />;
      }}
    />,
    <Route
      key="pyramidRouteEdit"
      path="/pyramid/:orgUnitId"
      component={routerProps => {
        return <EditOrgUnitContainer {...routerProps} {...props} />;
      }}
    />
  ];
};

export default pyramidRoute;
