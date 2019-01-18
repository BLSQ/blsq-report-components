import React from "react";
import InvoiceSelectionContainer from "./InvoiceSelectionContainer";
import { Route } from "react-router-dom";

const invoiceSelectionRoute = props => {
  return (
    <Route
      key="invoiceSelectionRoute"
      path="/select"
      exact
      component={routerProps => (
        <InvoiceSelectionContainer
          {...routerProps}
          invoices={props.invoices}
          currentUser={props.currentUser}
          onPeriodChange={props.onPeriodChange}
          onOuSearchChange={props.onOuSearchChange}
          ouSearchValue={props.ouSearchValue}
          orgUnits={props.orgUnits}
          period={props.period}
          {...props.config.global}
          dhis2={props.dhis2}
        />
      )}
    />
  );
};

export default invoiceSelectionRoute;
