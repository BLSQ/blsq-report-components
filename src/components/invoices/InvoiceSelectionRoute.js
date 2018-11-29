import React from "react";
import InvoiceSelectionContainer from "./InvoiceSelectionContainer";
import { Route } from "react-router-dom";

const invoiceSelectionRoute = props => (
  <Route
    path="/"
    component={routerProps => (
      <InvoiceSelectionContainer
        {...routerProps}
        invoices={props.innvoices}
        currentUser={props.currentUser}
        onPeriodChange={props.onPeriodChange}
        period={props.period}

      />
    )}
  />
);

export default invoiceSelectionRoute;
