import React from "react";
import DrawerLinks from "./DrawerLinks";
import {
  AppDrawer,
  Dhis2,
  configureI18N,
  DatePeriods,
  PluginRegistry,
  InvoiceSelectionContainer
} from "@blsq/blsq-report-components";
import Invoices from "./invoices/Invoices";
import { Route, Redirect } from "react-router-dom";
import customRoute from "./custom/CustomRoute";
import { I18nextProvider } from "react-i18next";
import SimpleDialogDemo from "./SimpleDialogDemo";
import config from "./invoices/Config";

const defaultLang = "fr";
DatePeriods.setLocale(defaultLang);
const i18n = configureI18N(defaultLang);

i18n.addResourceBundle("fr", "translation", {
  report_and_invoices: "Custom caption"
});

const Demo = props => {
  return (
    <SimpleDialogDemo
      params={props}
      dhis2={new Dhis2()}
      data={config.global.validation}
    />
  );
};
const Demo2 = props => <span>Read only</span>;

const appPlugin = {
  key: "exampleApp",
  extensions: {
    "invoices.actions": [Demo, Demo2]
  }
};

PluginRegistry.register(appPlugin);

const incentivesDescriptors = [
  {
    name: "Demo",
    dataSet: "vc6nF5yZsPR"
  }
];
const customDefaultRoute = (
  <Route
    exact
    path="/"
    render={() => {
      return <Redirect key="defaultSelect" from="/" to="/selectiond" />;
    }}
  />
);

const routeToCustomSelector = props => (
  <Route
    key="OuSelectionRoute"
    path="/selectiond"
    component={routerProps => {
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
          resultsElements={DrawerLinks}
        />
      );
    }}
  />
);

const customRoutes = params => {
  return [
    customDefaultRoute,
    customRoute(params),
    routeToCustomSelector(params)
  ];
};

const dataElementGroups = [
  {
    name: "Acute Flaccid Paralysis (AFP)",
    id: "oDkJh5Ddh7d"
  },
  {
    name: "Anaemia",
    id: "KmwPVkjp7yl"
  },
  { name: "ANC", id: "qfxEYY9xAl6" }
];

const App = t => (
  <I18nextProvider i18n={i18n}>
    <AppDrawer
      incentivesDescriptors={incentivesDescriptors}
      drawerLinks={DrawerLinks}
      invoices={Invoices}
      routes={customRoutes}
      dataElementGroups={dataElementGroups}
      defaultPathName={"/selectiond"}
      config={{
        global: {
          periodFormat: {
            quarterly: "quarter",
            monthly: "monthYear",
            sixMonthly: "sixMonth"
          },
          levels: ["Country", "Territory", "Land", "Facility"]
        }
      }}
      dhis2={new Dhis2({ categoryComboId: "t3aNCvHsoSn" })}
    />
  </I18nextProvider>
);

export default App;
