import React from "react";
import { Route, Redirect } from 'react-router-dom'

const invoiceRoute = props => (
  <Redirect from="/invoices/:period/:orgUnitId/:invoiceCode" to="/reports/:period/:orgUnitId/:invoiceCode" />
);

export default invoiceRoute;
