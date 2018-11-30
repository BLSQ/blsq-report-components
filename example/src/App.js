import React from "react";

import DrawerLinks from "./DrawerLinks";
import { AppDrawer } from "blsq-report-components";

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
}
const App = () => (
  <AppDrawer
    incentivesDescriptors={incentivesDescriptors}
    drawerLinks={DrawerLinks}
    invoices={Invoices}
    routes={customRoutes}
  />
);

export default App;
