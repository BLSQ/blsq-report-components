import React from "react";
import InvoiceSelectionContainer from "./InvoiceSelectionContainer";
import { Route } from "react-router-dom";

const invoiceSelectionRoute = props => {
  return (
    <Route
      key="invoiceSelectionRoute"
      path="/select"
      exact
      component={routerProps => {
        const params = new URLSearchParams(
          routerProps.location.search.substring(1)
        );
        const period = params.get("period");
        const parent = params.get("parent");
        let ouSearchValue = params.get("q");
        if (!ouSearchValue) {
          ouSearchValue=""
        }
        return (
          <InvoiceSelectionContainer
            key="InvoiceSelectionContainer"
            {...routerProps}
            invoices={props.invoices}
            currentUser={props.currentUser}
            onPeriodChange={props.onPeriodChange}
            orgUnits={props.orgUnits}
            period={period || props.period}
            {...props.config.global}
            dhis2={props.dhis2}
            topLevelsOrgUnits={props.topLevelsOrgUnits}
            parent={parent}
            ouSearchValue={ouSearchValue}
          />
        );
      }}
    />
  );
};

export default invoiceSelectionRoute;
