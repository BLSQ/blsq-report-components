import PluginRegistry from "../core/PluginRegistry";
import DatePeriods from "../../support/DatePeriods";

import { Typography } from "@material-ui/core";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import PeriodPicker from "../shared/PeriodPicker";
import PortalHeader from "../shared/PortalHeader";
import Paper from "@material-ui/core/Paper";

import { makeStyles } from "@material-ui/core";

const codify = (str) => {
  if (str == undefined) {
    return undefined;
  }
  const code = str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("/", "_")
    .replace(/-/g, "_")
    .replace(/'/g, "_")
    .replace(/ /g, "_")
    .replace(/__/g, "_")
    .toLowerCase();

  return code;
};

const StatSpan = ({ stat }) => {
  return <span style={{ color: stat > 0 ? "" : "grey" }}>{stat}</span>;
};

const GroupSetStats = ({ groupStats }) => (
  <table>
    <thead>
      <tr>
        <th width="200px">Group</th>
        <th width="100px">Add</th>
        <th width="100px">Remove</th>
        <th width="100px">Keep</th>
      </tr>
    </thead>
    <tbody>
      {groupStats
        .sort((a, b) => (a.group.name > b.group.name ? 1 : -1))
        .map((groupInfo) => {
          return (
            <tr key={groupInfo.group.name}>
              <td>{groupInfo.group.name}</td>
              <td style={{ textAlign: "right" }}>
                <StatSpan stat={groupInfo.stats.add || 0} />
              </td>
              <td style={{ textAlign: "right" }}>
                <StatSpan stat={groupInfo.stats.remove || 0} />
              </td>
              <td style={{ textAlign: "right" }}>
                <StatSpan stat={groupInfo.stats.keep || 0} />
              </td>
            </tr>
          );
        })}
    </tbody>
  </table>
);

const ContractsStats = ({ groupStats, groupSetIndex }) => (
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    {groupStats &&
      Object.values(_.groupBy(groupStats, (s) => s.group.groupSetCode)).map((stats, index) => (
        <div key={index} style={{ margin: "10px" }}>
          <h4>{groupSetIndex.groupSetsByCode[stats[0].group.groupSetCode].name}</h4>
          <GroupSetStats groupStats={stats}></GroupSetStats>
        </div>
      ))}
  </div>
);

const ContractsResume = ({ contractInfos, progress }) => (
  <div>
    {contractInfos && (
      <span>
        {contractInfos.length} orgunits, {contractInfos.filter((c) => c.synchronized).length} already synchronized.
      </span>
    )}
  </div>
);

const ContractsTable = ({ contractInfos, fixGroups }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell component="th">
          <b>Org unit</b>
        </TableCell>
        <TableCell component="th">
          <b>Selected contract</b>
        </TableCell>
        <TableCell component="th">
          <b>Proposed Changes</b>
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {contractInfos.map((contractInfos) => (
        <TableRow key={contractInfos.orgUnit.id}>
          <TableCell>
            {contractInfos.orgUnit.name} <br></br>
            <code>
              {" "}
              {contractInfos.orgUnit.ancestors.slice(1, contractInfos.orgUnit.ancestors.length - 1).map((a, index) => (
                <span key={"ancestor-" + index}>
                  {a.name} {index < contractInfos.orgUnit.ancestors.length - 3 ? " > " : ""}
                </span>
              ))}
            </code>
            <br></br> contracts : {contractInfos.orgUnitContracts.length}
          </TableCell>
          <TableCell>
            {contractInfos.contractForPeriod && (
              <div
                style={{
                  color: contractInfos.contractedForPeriod ? "" : "grey",
                }}
              >
                {Array.from(new Set(contractInfos.contractForPeriod.codes)).join(", ")} <br></br>
                <a target="_blank" href={"./index.html#/contracts/" + contractInfos.orgUnit.id}>
                  {contractInfos.contractForPeriod.startPeriod} - {contractInfos.contractForPeriod.endPeriod}
                </a>
              </div>
            )}
          </TableCell>
          <TableCell>
            {contractInfos.actions.map((action) => (
              <span
                key={action.kind + "-" + action.group.name}
                style={{
                  textDecoration: action.kind == "remove" ? "line-through" : "",
                  color: action.kind == "keep" ? "grey" : "",
                }}
                title={action.kind + " " + action.group.name}
              >
                {action.group.name} <br></br>
              </span>
            ))}
          </TableCell>
          <TableCell>{contractInfos.warnings.join("\n")}</TableCell>
          <TableCell>
            {contractInfos && !contractInfos.synchronized && (
              <Button onClick={() => fixGroups([contractInfos])}>Fix me !</Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const codifyObject = (dhis2Object) => (dhis2Object.hesabuCode = codify(dhis2Object.code) || codify(dhis2Object.name));

const indexGroupSet = (organisationUnitGroupSets) => {
  const groupsByCode = {};
  const groupSetsByCode = {};
  for (let organisationUnitGroupSet of organisationUnitGroupSets) {
    codifyObject(organisationUnitGroupSet);
    groupSetsByCode[organisationUnitGroupSet.hesabuCode] = organisationUnitGroupSet;
    for (let organisationUnitGroup of organisationUnitGroupSet.organisationUnitGroups) {
      organisationUnitGroup.groupSetCode = organisationUnitGroupSet.hesabuCode;
      codifyObject(organisationUnitGroup);
      groupsByCode[organisationUnitGroup.hesabuCode] = organisationUnitGroup;
    }
  }
  return {
    groupsByCode,
    groupSetsByCode,
  };
};

const buildContractInfos = (contractsByOrgunits, groupSetIndex, period, contractFields) => {
  const monthPeriod = DatePeriods.split(period, "monthly")[0];
  const results = [];
  for (let orgUnitContracts of Object.values(contractsByOrgunits)) {
    const warnings = [];
    const orgUnit = orgUnitContracts[0].orgUnit;
    const contractsForPeriod = orgUnitContracts.filter((contract) => contract.matchPeriod(period));

    let contractForPeriod;
    let contractedForPeriod;

    if (contractsForPeriod.length > 1) {
      warnings.push(contractsForPeriod.length + " contracts for the period");
    } else {
      contractForPeriod = contractsForPeriod[0];

      if (contractsForPeriod.length == 0) {
        contractForPeriod = _.minBy(orgUnitContracts, (contract) => distance(contract, monthPeriod));
        contractedForPeriod = false;
      } else {
        contractedForPeriod = true;
      }
    }

    let actions = [];
    if (contractForPeriod) {
      const groupSet = groupSetIndex.groupSetsByCode["contracts"];

      if (groupSet) {
        const contractedGroup = groupSet.organisationUnitGroups.find((g) => g.hesabuCode == "contracted");
        const nonContractedGroup = groupSet.organisationUnitGroups.find((g) => g.hesabuCode == "non_contracted");

        if (contractedGroup && nonContractedGroup) {
          const isInContractedGroup = contractedGroup.organisationUnits.some((ou) => ou.id == orgUnit.id);
          const isInNonContractedGroup = nonContractedGroup.organisationUnits.some((ou) => ou.id == orgUnit.id);

          if (contractedForPeriod) {
            if (isInContractedGroup) {
              actions.push({ kind: "keep", group: contractedGroup, orgUnit });
            }
            if (!isInContractedGroup) {
              actions.push({ kind: "add", group: contractedGroup, orgUnit });
            }
            if (isInNonContractedGroup) {
              actions.push({
                kind: "remove",
                group: nonContractedGroup,
                orgUnit,
              });
            }
          } else {
            if (isInContractedGroup) {
              actions.push({ kind: "remove", group: contractedGroup, orgUnit });
            }
            if (!isInNonContractedGroup) {
              actions.push({ kind: "add", group: nonContractedGroup, orgUnit });
            }
            if (isInNonContractedGroup) {
              actions.push({ kind: "keep", group: nonContractedGroup, orgUnit });
            }
          }
        }
      }
    }
    if (contractForPeriod) {
      for (let contractField of contractFields) {
        const groupSet = groupSetIndex.groupSetsByCode[contractField.code];
        if (groupSet) {
          for (let group of groupSet.organisationUnitGroups) {
            if (contractField.optionSet.options.some((o) => o.code === group.hesabuCode)) {
              const isInGroup = group.organisationUnits.some((ou) => ou.id == orgUnit.id);
              if (isInGroup && !contractForPeriod.codes.includes(group.hesabuCode)) {
                actions.push({ kind: "remove", group, orgUnit });
              }
              if (!isInGroup && contractForPeriod.codes.includes(group.hesabuCode)) {
                actions.push({ kind: "add", group, orgUnit });
              }
              if (isInGroup && contractForPeriod.codes.includes(group.hesabuCode)) {
                actions.push({ kind: "keep", group, orgUnit });
              }
            }
          }
        }
      }
    }

    actions = _.uniqBy(actions, (e) => e.group.id + "-" + e.kind);

    results.push({
      orgUnit,
      orgUnitContracts,
      contractForPeriod,
      contractedForPeriod,
      synchronized: actions.every((a) => a.kind == "keep"),
      actions,
      warnings,
    });
  }
  return results;
};

const buildStats = (results, groupSetIndex) => {
  const statsPerGroup = {};
  for (let contactInfo of results) {
    for (let action of contactInfo.actions) {
      if (statsPerGroup[action.group.hesabuCode] == undefined) {
        statsPerGroup[action.group.hesabuCode] = {};
      }
      statsPerGroup[action.group.hesabuCode][action.kind] =
        (statsPerGroup[action.group.hesabuCode][action.kind] || 0) + 1;
    }
  }
  const displayableStats = [];
  for (const [groupCode, stats] of Object.entries(statsPerGroup)) {
    const group = groupSetIndex.groupsByCode[groupCode];
    displayableStats.push({ group, stats });
  }
  return displayableStats;
};

const distance = (contract, period) =>
  Math.min(parseInt(contract.startPeriod) - parseInt(period), parseInt(contract.endPeriod) - parseInt(period));

const useStyles = makeStyles((theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(10),
  },
}));

const SyncProgramGroups = (props) => {
  const classes = useStyles(props);

  const period = props.match.params.period;
  const [progress, setProgress] = useState("");
  const [filter, setFilter] = useState("");
  const [contractInfos, setContractInfos] = useState([]);
  const [groupStats, setGroupStats] = useState(undefined);
  const [groupSetIndex, setGroupSetIndex] = useState(undefined);

  const loadContracts = async () => {
    const dhis2 = PluginRegistry.extension("core.dhis2");
    const api = await dhis2.api();
    setProgress("Loading groups");
    const ds = await api.get("organisationUnitGroupSets", {
      paging: false,
      fields: "id,code,name,organisationUnitGroups[id,code,name,organisationUnits[id,name]]",
    });

    const groupSetIndex = indexGroupSet(ds.organisationUnitGroupSets);
    setGroupSetIndex(groupSetIndex);

    const contractService = PluginRegistry.extension("contracts.service");
    setProgress("Loading contracts");

    const contracts = await contractService.findAll();
    const contractsByOrgunits = _.groupBy(contracts, (c) => c.orgUnit.id);

    const results = buildContractInfos(contractsByOrgunits, groupSetIndex, period, contractService.contractFields());
    results.sort((a, b) => {
      return a.orgUnit.path.localeCompare(b.orgUnit.path);
    });

    const displayableStats = buildStats(results, groupSetIndex);
    setProgress("Actions computed");

    setGroupStats(displayableStats);
    setContractInfos(results);
  };

  const fixGroups = async (contractInfosToFix) => {
    const dhis2 = PluginRegistry.extension("core.dhis2");
    const api = await dhis2.api();

    const modifiedGroups = {};
    for (let contractInfo of contractInfosToFix) {
      const actions = contractInfo.actions.filter((a) => a.kind !== "keep");
      for (const action of actions) {
        if (modifiedGroups[action.group.id] == undefined) {
          const loadedGroup = await api.get("organisationUnitGroups/" + action.group.id);
          modifiedGroups[action.group.id] = loadedGroup;
        }
        const groupToModify = modifiedGroups[action.group.id];
        const isInGroup = groupToModify.organisationUnits.find((ou) => ou.id === action.orgUnit.id);
        if (action.kind === "remove" && isInGroup) {
          groupToModify.organisationUnits = groupToModify.organisationUnits.filter((ou) => ou.id !== action.orgUnit.id);
        }
        if (action.kind === "add" && !isInGroup) {
          groupToModify.organisationUnits.push({ id: action.orgUnit.id });
        }
      }
    }

    for (let orgUnitGroup of Object.values(modifiedGroups)) {
      setProgress("Updating " + orgUnitGroup.name);
      const resp = await api.update("organisationUnitGroups/" + orgUnitGroup.id, orgUnitGroup);
      console.log(resp);
      setProgress("Updated " + orgUnitGroup.name);
    }
    loadContracts();
  };

  useEffect(() => {
    loadContracts();
  }, [period]);

  let filteredContractInfos = contractInfos;
  if (filter != "") {
    if (filter.startsWith("ancestor:")) {
      const ancestorName = filter.slice("ancestor:".length);
      filteredContractInfos = filteredContractInfos.filter((c) => {
        return c.orgUnit.ancestors.some((a) => a.name.includes(ancestorName));
      });
    } else {
      filteredContractInfos = filteredContractInfos.filter((c) => {
        const actionsToApply = c.actions.filter((k) => k.kind == "remove" || k.kind == "add");

        if (actionsToApply.length == 0) {
          return false;
        }
        return actionsToApply.every((c) => c.group.name == filter);
      });
    }
  }
  return (
    <div>
      <Paper className={classes.root}>
        <div>
          <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "flex-start" }}>
            <Typography variant="h5" style={{ marginRight: "20px" }}>
              Synchronize groups based on contracts
            </Typography>
            <div>
              <PeriodPicker
                disableInputLabel={true}
                period={period}
                periodDelta={{
                  before: 5,
                  after: 5,
                }}
                onPeriodChange={(newPeriod) => {
                  props.history.push("/sync/program-groups/" + newPeriod);
                }}
              ></PeriodPicker>
            </div>
            <br></br>
          </div>
        </div>
        <div style={{ marginLeft: "50px", marginBottom: "20px" }}>
          <ContractsStats groupStats={groupStats} groupSetIndex={groupSetIndex} />

          <ContractsResume contractInfos={filteredContractInfos} progress={progress} />
        </div>
        <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "flex-start", columnGap: "2em" }}>
          <Input
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
            }}
          />
          <Button onClick={() => fixGroups(filteredContractInfos)} color="primary" variant="contained">
            Synchronize ALL !
          </Button>
          <b>
            <i>{progress}</i>
          </b>
        </div>
        <ContractsTable contractInfos={filteredContractInfos} fixGroups={fixGroups} />
      </Paper>
    </div>
  );
};

export default SyncProgramGroups;
