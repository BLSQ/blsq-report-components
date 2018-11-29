import React from "react";

import { HashRouter as Router, Route, Switch, Link } from "react-router-dom";
import {
  incentiveRoute,
  invoiceSelectionRoute,
  invoiceRoute,
  browseDataRoute
} from "blsq-report-components";

import Invoices from "./invoices/Invoices";

const incentivesDescriptors = [
  {
    name: "Demo",
    dataSet: "vc6nF5yZsPR"
  }
];

const user = {
  name: "Demo",
  organisationUnits: [
    {
      id: "ImspTQPwCqd"
    }
  ],
  dataViewOrganisationUnits: [
    {
      id: "ImspTQPwCqd"
    }
  ]
};

const onPeriodChange = () => {
  return "201801";
};

const params = {
  period: "2018Q1",
  invoices: Invoices,
  incentivesDescriptors: incentivesDescriptors,
  currentUser: user,
  onPeriodChange: onPeriodChange
};

const App = () => (
  <div>
    <Router>
      <div>
        <Link to="/">Find invoice</Link>
        <br />
        <Link to="/data/201801/deg/oDkJh5Ddh7d/ImspTQPwCqd">Data</Link>
        <br />
        <Link to="/incentives/201801/vc6nF5yZsPR">Incentives</Link>
        <br />
        <Link to="/invoices/2018Q1/cDw53Ej8rju/demo-chc">Sample invoice</Link>

        <Switch>
          {browseDataRoute(params)}
          {incentiveRoute(params)}
          {invoiceRoute(params)}
          {invoiceSelectionRoute(params)}
        </Switch>
      </div>
    </Router>
  </div>
);

export default App;
