import React from "react";
import PropTypes from "prop-types";
import { withNamespaces } from "react-i18next";

import { Grid } from "@material-ui/core";

const ContractField = ({ label, value }) => (
  <Grid container spacing={1}>
    <Grid container item xs={6} justify="flex-end" alignContent="center">
      {label}:
    </Grid>
    <Grid container item xs={6} justify="flex-start">
      {value}
    </Grid>
  </Grid>
);

ContractField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default withNamespaces()(ContractField);
