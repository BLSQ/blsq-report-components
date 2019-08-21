import React from "react";
import DrawerLinks from "./DrawerLinks";
import { AppDrawer, Dhis2, configureI18N, DatePeriods } from "@blsq/blsq-report-components";
import Invoices from "./invoices/Invoices";
import customRoute from "./custom/CustomRoute";
import { I18nextProvider } from "react-i18next";

const defaultLang = "fr";
DatePeriods.setLocale(defaultLang);

const i18n = configureI18N(defaultLang);

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

const App = t => (
  <I18nextProvider i18n={i18n}>
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
          levels: ["Country", "Territory", "Land", "Facility"]
        }
      }}
      dhis2={new Dhis2()}
    />
  </I18nextProvider>
);

export default App;
