import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import PluginRegistry from "../../core/PluginRegistry";
import { Button, Typography } from "@material-ui/core";
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

const LevelStats = ({ field, stats, classes, total }) => {
  const size = 20;
  const limitEnablable = stats.length > size;
  const [limited, setLimited] = useState(limitEnablable);
  const displayedStats = limited ? stats.slice(0, size) : stats;
  return (
    <div key={field} className={classes.statContainer}>
      <Typography variant="h5">{field}</Typography>
      <table width="100%">
        <tbody>
          {displayedStats.map((stat) => (
            <tr key={stat.option ? stat.option.name : "null"}>
              <td className={classes.td} width="50%">
                {stat.option ? stat.option.name : <span className={classes.noData}>not specified</span>}
              </td>
              <td align="right" width="25%">
                <Typography className={stat.count == 0 ? classes.noData : classes.td}>{stat.count}</Typography>
              </td>
              <td align="right" width="25%">
                <Typography className={stat.count == 0 ? classes.noData : classes.td}>
                  {(100 * (stat.count / total)).toFixed(1)} %
                </Typography>
              </td>
            </tr>
          ))}
          {limitEnablable && (
            <tr>
              <td>
                <Button onClick={() => setLimited(!limited)}> {limited ? "Show all" : "Hide"}</Button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const ContractsAncestorStats = ({ filteredContracts }) => {
  const classes = useStyles();
  const contractService = PluginRegistry.extension("contracts.service");
  const fields = ["Level 2", "Level 3"];

  const statsPerField = {};
  fields.forEach((field, index) => {
    statsPerField[field] = [];
    const allOrgUnitsForLevel = filteredContracts.map((c) => c.orgUnit.ancestors[index + 1]);
    const contractsByOrgunit = _.groupBy(allOrgUnitsForLevel, (ou) => (ou ? ou.id : undefined));

    for (let ouId of Object.keys(contractsByOrgunit)) {
      const contractsForOu = contractsByOrgunit[ouId];
      statsPerField[field].push({
        field: field,
        option: contractsForOu[0] ? { name: contractsForOu[0].name } : undefined,
        count: contractsForOu.length,
      });
    }

    statsPerField[field] = _.sortBy(statsPerField[field], ["option.name"]);
  });

  return fields
    .filter((field) => statsPerField[field])
    .map((field) => {
      return (
        <LevelStats
          field={field}
          stats={statsPerField[field]}
          classes={classes}
          total={filteredContracts.length}
        ></LevelStats>
      );
    });
};

export default ContractsAncestorStats;
