import React from "react";
import { Route } from "react-router-dom";
import OrganisationUnitsContainer from "./OrganisationUnitsContainer";

const pyramidRoute = props => (
  <Route
    key="pyramidRoute"
    path="/pyramid"
    component={routerProps => {
      return <OrganisationUnitsContainer {...routerProps} {...props} />;
    }}
  />
);

export default pyramidRoute;
