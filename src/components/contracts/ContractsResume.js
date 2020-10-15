import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { withNamespaces } from "react-i18next";

import tablesStyles from "../styles/tables";

const styles = (theme) => ({
  ...tablesStyles(theme),
});

const useStyles = makeStyles((theme) => styles(theme));

const ContractResume = ({ contracts, filteredContracts, overlapsTotal, t }) => {
  const classes = useStyles();
  if (contracts.length === 0) return "";
  return (
    <span className={classes.tableTitle}>
      {filteredContracts.length === contracts.length &&
        contracts.length > 1 &&
        t("contracts.results", { total: contracts.length })}
      {filteredContracts.length === contracts.length && contracts.length === 1 && t("contracts.result")}
      {filteredContracts.length < contracts.length &&
        t("contracts.resultsFiltered", {
          filtered: filteredContracts.length,
          total: contracts.length,
        })}
      {overlapsTotal > 0 && t("contracts.overlaps", { overlap: overlapsTotal })}.
    </span>
  );
};
ContractResume.defaultProps = {
  contracts: [],
  filteredContracts: [],
  overlapsTotal: 0,
};

ContractResume.propTypes = {
  contracts: PropTypes.array,
  filteredContracts: PropTypes.array,
  overlapsTotal: PropTypes.number,
  t: PropTypes.func.isRequired,
};

export default withNamespaces()(ContractResume);
