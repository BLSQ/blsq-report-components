import React from "react";

import { Link } from "react-router-dom";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

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

    <ListItem button component={Link} to="/custom/2018Q1/demo">
      <ListItemText primary="Custom Route and Page" />
    </ListItem>
    <ListItem
      button
      component={Link}
      to="/invoices/2018Q3/DqfiI6NVnB1/rbf_payment_for"
    >
      Auto generated invoice from orbf2 descriptor
    </ListItem>
    <ListItem
      button
      component={Link}
      to="/select?q=afro&period=2018Q2&parent=at6UHUQatSo"
    >
      Bookmarked search
    </ListItem>
  </React.Fragment>
);

export default DrawerLinks;
