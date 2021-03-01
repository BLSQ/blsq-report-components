import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import PluginRegistry from "../core/PluginRegistry";
import { Typography } from "@material-ui/core";
import ContractsPeriodStats from "./ContractsPeriodStats";

const styles = (theme) => ({
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

const useStyles = makeStyles((theme) => styles(theme));

const ContractsStats = ({ filteredContracts }) => {
  const classes = useStyles();
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
                        {stat.option ? stat.option.name : <span className={classes.noData}>not specified</span>}
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
      <ContractsPeriodStats filteredContracts={filteredContracts} />
    </div>
  );
};

export default ContractsStats;
