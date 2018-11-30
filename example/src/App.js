import React from "react";

import { Link } from "react-router-dom";
import { AppDrawer } from "blsq-report-components";

import Invoices from "./invoices/Invoices";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

const incentivesDescriptors = [
  {
    name: "Demo",
    dataSet: "vc6nF5yZsPR"
  }
];

const DrawerLinks = props => (
  <React.Fragment>
    <ListItem
      button
      component={Link}
      to="/data/201801/deg/oDkJh5Ddh7d/ImspTQPwCqd"
    >
      <ListItemText primary="Data" />
    </ListItem>

    <ListItem button component={Link} to="/incentives/201801/vc6nF5yZsPR">
      <ListItemText primary="Incentives" />
    </ListItem>

    <ListItem
      button
      component={Link}
      to="/invoices/2018Q1/cDw53Ej8rju/demo-chc"
    >
      <ListItemText primary="Sample invoice" />
    </ListItem>
  </React.Fragment>
);

const App = () => (
  <AppDrawer
    incentivesDescriptors={incentivesDescriptors}
    drawerLinks={DrawerLinks}
    invoices={Invoices}
  />
);

export default App;
