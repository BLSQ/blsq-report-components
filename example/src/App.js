import React from "react";

import DrawerLinks from "./DrawerLinks";
import { AppDrawer, Dhis2 } from "@blsq/blsq-report-components";

import Invoices from "./invoices/Invoices";

import customRoute from "./custom/CustomRoute";

const incentivesDescriptors = [
  {
    name: "Demo",
    dataSet: "vc6nF5yZsPR"
  }
];
const customRoutes = params => {
  return [customRoute(params)];
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
const App = () => (
  <AppDrawer
    incentivesDescriptors={incentivesDescriptors}
    drawerLinks={DrawerLinks}
    invoices={Invoices}
    routes={customRoutes}
    dataElementGroups={dataElementGroups}
    config={{
      global: {
        periodFormat: {
          quarterly: "quarter",
          monthly: "monthYear",
          sixMonthly: "sixMonth"
        },
        levels: ["Country", "Territory", "Land", "Facility"],      }
    }}
    dhis2={new Dhis2()}
  />
);

export default App;
