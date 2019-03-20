import React from "react";
import { Route } from "react-router-dom";
import MainContainer from "./MainContainer";

const pyramidRoute = props => (
  <Route
    key="pyramidRoute"
    path="/pyramid"
    component={routerProps => {
      const params = new URLSearchParams(
        routerProps.location.search.substring(1)
      );
      const parent = params.get("parent");
      let ouSearchValue = params.get("q");
      if (!ouSearchValue) {
        ouSearchValue = "";
      }

      return (
        <MainContainer
          key="OuSelectionContainer"
          {...routerProps}
          {...props.config.global}
          orgUnits={props.orgUnits}
          currentUser={props.currentUser}
          topLevelsOrgUnits={props.topLevelsOrgUnits}
          parent={parent}
          dhis2={props.dhis2}
          ouSearchValue={ouSearchValue}
        />
      );
    }}
  />
);

export default pyramidRoute;
