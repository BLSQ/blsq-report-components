import React from "react";
import InvoicePage from "./InvoicePage";
import { Route } from "react-router-dom";

const invoiceRoute = props => (
  <Route
    path="/invoices/:period/:orgUnitId/:invoiceCode"
    component={routerProps => {
      return(
      <InvoicePage
        {...routerProps}
        invoices={props.invoices}
        currentUser={props.currentUser}
        onPeriodChange={props.onPeriodChange}
      />
      )
    }}
  />
);

export default invoiceRoute;
