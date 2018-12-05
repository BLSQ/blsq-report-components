import React from "react";

import DrawerLinks from "./DrawerLinks";
import { AppDrawer } from "@blsq/blsq-report-components";

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
const App = () => (
  <AppDrawer
    incentivesDescriptors={incentivesDescriptors}
    drawerLinks={DrawerLinks}
    invoices={Invoices}
    routes={customRoutes}
    config={{
      global: {
        periodFormat: {
          quarterly: "quarter",
          monthly: "monthYear"
        },
        levels: ["Country", "Territory", "Land", "Facility"],
        contractedOrgUnitGroupId: "GGghZsfu7qV"
      }
    }}
  />
);

export default App;
