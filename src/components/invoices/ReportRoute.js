import React from "react";
import InvoicePage from "./InvoicePage";
import { Route } from "react-router-dom";

const invoiceRoute = props => (
  <Route
    key="reportRoute"
    path="/reports/:period/:orgUnitId/:invoiceCode"
    component={routerProps => {
      return (
        <InvoicePage
          {...routerProps}
          invoices={props.invoices}
          currentUser={props.currentUser}
          onPeriodChange={props.onPeriodChange}
          {...props.config.global}
          dhis2={props.dhis2}
        />
      );
    }}
  />
);

export default invoiceRoute;
