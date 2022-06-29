import React from "react";
import InvoiceSelectionContainer from "./InvoiceSelectionContainer";
import InvoicePage from "./InvoicePage";
import OrgUnitInvoiceSelectionPage from "./OrgUnitInvoiceSelectionPage";
import { Route } from "react-router-dom";
import PluginRegistry from "../core/PluginRegistry";
import Approvals from "../approvals/Approvals";

const invoiceRoutes = (props) => {
  return [
    <Route
      key="reportRoute"
      path="/reports/:period/:orgUnitId/:invoiceCode"
      component={(routerProps) => {
        const invoices = PluginRegistry.extension("invoices.invoices");
        return (
          <InvoicePage
            {...routerProps}
            invoices={invoices}
            currentUser={props.currentUser}
            onPeriodChange={props.onPeriodChange}
            {...props.config.global}
            dhis2={props.dhis2}
          />
        );
      }}
    />,
    <Route
      key="orgUnitRoute"
      path="/reports/:period/:orgUnitId"
      exact
      component={(routerProps) => {
        const invoices = PluginRegistry.extension("invoices.invoices");
        return (
          <OrgUnitInvoiceSelectionPage
            currentUser={props.currentUser}
            invoices={invoices}
            dhis2={props.dhis2}
            {...routerProps}
            {...props.config.global}
          />
        );
      }}
    />,
    <Route
      key="invoiceSelectionRoute"
      path="/select"
      exact
      component={(routerProps) => {
        const params = new URLSearchParams(routerProps.location.search.substring(1));
        const period = params.get("period");
        const parent = params.get("parent");
        const viewType = params.get("mode") || "table";
        let ouSearchValue = params.get("q");
        if (!ouSearchValue) {
          ouSearchValue = "";
        }
        const invoices = PluginRegistry.extension("invoices.invoices");
        return (
          <InvoiceSelectionContainer
            key="InvoiceSelectionContainer"
            {...routerProps}
            invoices={invoices}
            currentUser={props.currentUser}
            onPeriodChange={props.onPeriodChange}
            orgUnits={props.orgUnits}
            period={period || props.period}
            {...props.config.global}
            dhis2={props.dhis2}
            topLevelsOrgUnits={props.topLevelsOrgUnits}
            parent={parent}
            ouSearchValue={ouSearchValue}
            viewType={viewType}
          />
        );
      }}
    />,
    <Route key="approvalsRoute" path="/approvals/:workflowids/:period" exact component={Approvals} />,
  ];
};

export default invoiceRoutes;
