import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

import tablesStyles from "../styles/tables";
import PluginRegistry from "../core/PluginRegistry";
import { Typography, IconButton } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";

const styles = (theme) => ({
  ...tablesStyles(theme),
});

const useStyles = makeStyles((theme) => styles(theme));

const statsStyles = (theme) => ({
  td: {
    whiteSpace: "nowrap",
    minWidth: "100px",
  },
  noData: {
    color: "lightgrey",
    minWidth: "100px",
  },
  statContainer: {
    marginLeft: "50px",
  },
});

const useStylesStats = makeStyles((theme) => statsStyles(theme));

const Stats = ({ filteredContracts }) => {
  const classes = useStylesStats();
  const contractService = PluginRegistry.extension("contracts.service");
  const fields = contractService.contractFields();

  const statsPerField = {};
  fields.forEach((field) => {
    if (field.optionSet) {
      statsPerField[field.code] = [];
      for (let option of field.optionSet.options) {
        const matchingContracts = filteredContracts.filter((c) => c.fieldValues[field.code] == option.code);

        statsPerField[field.code].push({ field: field, option: option, count: matchingContracts.length });
      }
      const undefinedContracts = filteredContracts.filter((c) => c.fieldValues[field.code] == undefined);

      statsPerField[field.code].push({ field: field, option: undefined, count: undefinedContracts.length });
    }
  });

  return (
    <div style={{ display: "flex" }}>
      {fields
        .filter((field) => statsPerField[field.code])
        .map((field) => {
          return (
            <div key={field.code} className={classes.statContainer}>
              <Typography variant="h5">{field.name}</Typography>
              <table width="100%">
                <tbody>
                  {statsPerField[field.code].map((stat) => (
                    <tr key={statsPerField[field.code] + "-" + (stat.option ? stat.option.name : "null")}>
                      <td className={classes.td} width="50%">
                        {stat.option ? stat.option.name : "null"}
                      </td>
                      <td align="right" width="25%">
                        <Typography className={stat.count == 0 ? classes.noData : classes.td}>{stat.count}</Typography>
                      </td>
                      <td align="right" width="25%">
                        <Typography className={stat.count == 0 ? classes.noData : classes.td}>
                          {(100 * (stat.count / filteredContracts.length)).toFixed(1)} %
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
    </div>
  );
};

const ContractResume = ({ contracts, filteredContracts, overlapsTotal, t }) => {
  const classes = useStyles();
  const [showStats, setShowStats] = React.useState(false);
  if (contracts.length === 0) return "";
  return (
    <>
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
      <IconButton
        size="small"
        disableRipple
        disableFocusRipple
        className={classes.button}
        onClick={() => setShowStats(!showStats)}
      >
        <InfoIcon color="action" />
      </IconButton>
      {showStats && <Stats filteredContracts={filteredContracts}></Stats>}
    </>
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

export default withTranslation()(ContractResume);
