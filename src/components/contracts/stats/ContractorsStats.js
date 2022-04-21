import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

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

const ContractorsStats = ({ contracts, filteredContracts, fields }) => {
  if (contracts == undefined || fields == undefined) {
    return <></>;
  }
  if (fields.find((f) => f.code === "contract_main_orgunit") == undefined) {
    return <></>;
  }

  const classes = useStyles();

  const subcontractorsByMainOrgUnitId = _.groupBy(contracts, (c) => c.fieldValues["contract_main_orgunit"]);
  const mainContracts = filteredContracts.filter((c) => subcontractorsByMainOrgUnitId[c.orgUnit.id] !== undefined);
  const subcontractorsDistribution = {};
  const subcontractorsDistributionSample = {};
  for (let mainContractor of filteredContracts) {
    const subcontractors = subcontractorsByMainOrgUnitId[mainContractor.orgUnit.id];
    const numberOfSubcontractors = subcontractors ? subcontractors.length : 0;
    subcontractorsDistribution[numberOfSubcontractors] ||= 0;
    subcontractorsDistribution[numberOfSubcontractors] += 1;

    subcontractorsDistributionSample[numberOfSubcontractors] ||= [];
    subcontractorsDistributionSample[numberOfSubcontractors].push(mainContractor);
  }
  debugger;
  return (
    <div className={classes.statContainer}>
      <Typography variant="h5">Number of subcontractors distribution</Typography>
      <table width="500px">
          <thead>
              <tr>
              <th># of subc</th>
              <th>#</th>
              <th>%</th>
              <th  width="75%">Sample</th>
              </tr>
          </thead>
        <tbody>
          {Object.entries(subcontractorsDistribution).map((stat) => (
            <tr key={"stats-" + stat[0]}>
                
              <td className={classes.td} width="5%">
                {stat[0] ? stat[0] : <span className={classes.noData}>not specified</span>}
              </td>
              <td align="right" width="5%">
                <Typography className={classes.td}>{stat[1]}</Typography>
              </td>
              <td align="right" width="5%">
                <Typography className={classes.td}>
                  {filteredContracts.length !== 0 ? (100 * (stat[1] / filteredContracts.length)).toFixed(1) : "-"} %
                </Typography>
              </td>
              <td align="left" valign="top" width="75%">
                {subcontractorsDistributionSample[stat[0]]
                  .slice(0, 2)
                  .map((o) => <span>{o.orgUnit.name}<br></br></span>)}
                  
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <i>At least 1 subc</i>
            </td>
            <td align="right" width="25%">
              <b>{mainContracts.length}</b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ContractorsStats;
