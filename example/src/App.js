import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import { HashRouter as Router, Route, Switch, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import {
  InvoiceBuilder,
  BrowseDataPage,
  IncentivePage,
  InvoicePage,
  DatePeriods,
  Dhis2
} from "blsq-report-components";

import Invoices from "./invoices/Invoices";

const user = {
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

const App = () => (
  <div>
    <Router>
      <div>
        <Link to="/data/201801/deg/oDkJh5Ddh7d/ImspTQPwCqd">Data</Link>
        <br />
        <Link to="/incentives/201801/vc6nF5yZsPR">Incentives</Link>
        <br />
        <Link to="/invoices/2018Q1/cDw53Ej8rju/demo-chc">Sample invoice</Link>

        <Switch>
          <Route
            exact
            path="/"
            render={props => (
              <InvoiceBuilder
                {...props}
                period={DatePeriods.split("201801", "quarterly")[0]}
                onPeriodChange={onPeriodChange}
                invoices={Invoices}
                currentUser={user}
              />
            )}
          />

          <Route
            path="/data/:period/:type/:dataElementGroupId/:orgUnitId"
            component={props => (
              <BrowseDataPage
                {...props}
                currentUser={user}
                onPeriodChange={onPeriodChange}
              />
            )}
          />

          <Route
            path="/invoices/:period/:orgUnitId/:invoiceCode"
            component={props => (
              <InvoicePage
                {...props}
                currentUser={user}
                onPeriodChange={onPeriodChange}
                invoices={Invoices}
              />
            )}
          />

          <Route
            path="/incentives/:period/:incentiveCode"
            component={props => (
              <IncentivePage
                {...props}
                incentivesDescriptors={[
                  {
                    name: "Demo",
                    dataSet: "vc6nF5yZsPR"
                  }
                ]}
                currentUser={user}
              />
            )}
          />
        </Switch>
      </div>
    </Router>
  </div>
);

export default App;
