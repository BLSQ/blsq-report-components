import React from "react";
import InvoiceSelectionContainer from "./InvoiceSelectionContainer";
import InvoicePage from "./InvoicePage"
import { Route, Redirect } from "react-router-dom";

const invoiceRoutes = (props) => {
  return [
    <Route
      key="reportRoute"
      path="/reports/:period/:orgUnitId/:invoiceCode"
      component={(routerProps) => {
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
    />,
    <Route
      key="invoiceSelectionRoute"
      path="/select"
      exact
      component={(routerProps) => {
        const params = new URLSearchParams(
          routerProps.location.search.substring(1)
        );
        const period = params.get("period");
        const parent = params.get("parent");
        let ouSearchValue = params.get("q");
        if (!ouSearchValue) {
          ouSearchValue = "";
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
    /*
    TODO this break things ?
    ,
    <Redirect key={"redirect-invoices-to-reports"}
      exact={true}
      from="/invoices/:period/:orgUnitId/:invoiceCode"
      to="/reports/:period/:orgUnitId/:invoiceCode"
    />,
    */
  ];
};

export default invoiceRoutes;
