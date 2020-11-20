import React from "react";
import DrawerLinks from "./DrawerLinks";
import {
  createMuiTheme,
  responsiveFontSizes,
} from "@material-ui/core/styles";

import {

  Dhis2,
  configureI18N,
  DatePeriods,
  PluginRegistry,
  InvoiceSelectionContainer,
  ContractPlugin,
} from "@blsq/blsq-report-components";
import Invoices from "./invoices/Invoices";
import { Route, Redirect } from "react-router-dom";
import customRoute from "./custom/CustomRoute";
import { I18nextProvider } from "react-i18next";
import SimpleDialogDemo from "./SimpleDialogDemo";
import BackButtonDemo from "./BackButtonDemo";
import config from "./invoices/Config";


const defaultLang = "fr";
DatePeriods.setLocale(defaultLang);
const i18n = configureI18N(defaultLang);

i18n.addResourceBundle("fr", "translation", {
  report_and_invoices: "Custom caption",
  back_buttom_caption: "Back to previous page",
});

let theme = createMuiTheme();
theme = responsiveFontSizes(theme);

const Demo = (props) => {
  return (
    <SimpleDialogDemo
      params={props}
      dhis2={new Dhis2()}
      data={config.global.validation}
    />
  );
};
const Demo2 = (props) => <span>Read only</span>;

const DemoBackButton = (props) => {
  return <BackButtonDemo />;
};

/**
I'm thinking of leaving this ContractBasedResolver in the invoice app and let them "handle" specifics
we have some "general" mechanism, but was always tricky to make right
often ending requesting "more" orgunits and filtering in the mapper

use cases
 - individual
      orgUnit Id
      get the contract and knows if it's a pca or pma

 - aggregated invoice/report
      the region/province/district/aire orgUnit Id
      and "get what's under" and belongs to set of groups (pma, pca)
      hard to be sure if "it's all codes or at least one code" or something more "fun"

 - contract based
     the primary orgUnit Id
     find all contracts that reference it as "contract_main_orgunit"

 - contract based
     a secondary orgUnit Id
     find all contracts that reference the same "contract_main_orgunit"

other kinds ?


http://localhost:3000/#/reports/2019Q4/pL5A7C1at1M/demo-contracts
http://localhost:3000/#/reports/2019Q4/BmKjwqc6BEw/demo-contracts

http://localhost:3000/#/contracts

 */

class ContractBasedResolver {
  async resolveOrgunits(dhis2, orgUnitId, period, invoiceType, mapper) {
    let mainOrgUnit;
    let orgUnits = [];
    let categoryCombo = "";
    const contractService = PluginRegistry.extension("contracts.service");

    const contracts = await contractService.findAll();

    orgUnits = contracts
      .filter(
        (contract) =>
          contract.matchPeriod(period) &&
          contract.orgUnit.path.includes(orgUnitId)
      )
      .map((contract) => contract.orgUnit);
    mainOrgUnit = orgUnits[0];

    return {
      mainOrgUnit,
      orgUnits,
      categoryCombo,
    };
  }
}
const withContracts = true;
const appPlugin = {
  key: "exampleApp",
  extensions: {
    "invoices.actions": [Demo, Demo2, DemoBackButton],
    "invoices.orgUnitsResolver": withContracts
      ? [new ContractBasedResolver()]
      : [],
  },
};
const contractConfig = {
  programId: "TwcqxaLn11C",
  allEventsSqlViewId: "QNKOsX4EGEk",
};

PluginRegistry.register(appPlugin);

if (withContracts) {
  PluginRegistry.register(new ContractPlugin(contractConfig));
}

const incentivesDescriptors = [
  {
    name: "Demo",
    dataSet: "vc6nF5yZsPR",
  },
];
const customDefaultRoute = (
  <Route
    exact
    path="/"
    render={() => {
      return <Redirect key="defaultSelect" from="/" to="/selection" />;
    }}
  />
);

const routeToCustomSelector = (props) => (
  <Route
    key="OuSelectionRoute"
    path="/selection"
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
          resultsElements={DrawerLinks}
        />
      );
    }}
  />
);

const customRoutes = (params) => {
  return [
    customDefaultRoute,
    customRoute(params),
    routeToCustomSelector(params),
  ];
};

const dataElementGroups = [
  {
    name: "Acute Flaccid Paralysis (AFP)",
    id: "oDkJh5Ddh7d",
  },
  {
    name: "Anaemia",
    id: "KmwPVkjp7yl",
  },
  { name: "ANC", id: "qfxEYY9xAl6" },
];
const options = { categoryComboId: "t3aNCvHsoSn" };

const appConfig = {
  global: {
    periodFormat: {
      quarterly: "quarter",
      monthly: "monthYear",
      sixMonthly: "sixMonth",
    },
    levels: ["Country", "Territory", "Land", "Facility"],
  },
}

const dhis2 = new Dhis2();


