import React, { useState } from "react";

import { Button, Input, makeStyles, Typography } from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import Paper from "@material-ui/core/Paper";
import { useMutation, useQuery } from "react-query";

import { buildStats, fetchContracts, indexGroupSet } from "./contracts";
import { constructGroupSyncTableColumns } from "./tables";
import ContractsResume from "./ContractsResume";
import ContractsStats from "./ContractsStats";
import PeriodPicker from "../../shared/PeriodPicker";
import PluginRegistry from "../../core/PluginRegistry";

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
  const [groupSetIndex, setGroupSetIndex] = useState(undefined);

  const fetchContractsQuery = useQuery(["contracts", period], async () => {
    setProgress("Loading groups");
    const groupSetIndex = await indexGroupSet();
    setGroupSetIndex(groupSetIndex);
    const results = await fetchContracts(groupSetIndex, period);
    setProgress("Actions computed");
    return results;
  });

  const groupStats =
    fetchContractsQuery?.data !== undefined ? buildStats(fetchContractsQuery?.data, groupSetIndex) : undefined;

  const contractInfos = fetchContractsQuery?.data !== undefined ? fetchContractsQuery?.data : [];

  const performAction = async (modifiedGroups, action) => {
    if (modifiedGroups[action.group.id] === undefined) {
      const dhis2 = PluginRegistry.extension("core.dhis2");
      const api = await dhis2.api();
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
  };

  const updateOrgUnitGroup = async (orgUnitGroup) => {
    setProgress("Updating " + orgUnitGroup.name);
    const dhis2 = PluginRegistry.extension("core.dhis2");
    const api = await dhis2.api();
    await api.update("organisationUnitGroups/" + orgUnitGroup.id, orgUnitGroup);
    setProgress("Updated " + orgUnitGroup.name);
  };

  const fixGroupsMutation = useMutation(async ({ contractInfosToFix }) => {
    const modifiedGroups = {};
    for (let contractInfo of contractInfosToFix) {
      const actions = contractInfo.actions.filter((a) => a.kind !== "keep");
      for (const action of actions) {
        await performAction(modifiedGroups, action);
      }
    }
    for (let orgUnitGroup of Object.values(modifiedGroups)) {
      await updateOrgUnitGroup(orgUnitGroup);
    }
    await fetchContractsQuery.refetch();
  });

  let filteredContractInfos = contractInfos;
  if (filter !== "") {
    if (filter.startsWith("ancestor:")) {
      const ancestorName = filter.slice("ancestor:".length);
      filteredContractInfos = filteredContractInfos.filter((c) => {
        return c.orgUnit.ancestors.some((a) => a.name.includes(ancestorName));
      });
    } else {
      filteredContractInfos = filteredContractInfos.filter((c) => {
        const actionsToApply = c.actions.filter((k) => k.kind === "remove" || k.kind === "add");

        if (actionsToApply.length === 0) {
          return false;
        }
        return actionsToApply.every((c) => c.group.name === filter);
      });
    }
  }
  const data = filteredContractInfos;
  const options = {
    enableNestedDataAccess: ".",
    filter: true,
    print: false,
    rowsPerPage: 5,
    rowsPerPageOptions: [1, 5, 10, 20, 50, 100, 1000],
    download: false,
    selectableRows: "none",
    elevation: 0,
  };
  const columns = constructGroupSyncTableColumns(data, {fixGroupsMutation});
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
              />
            </div>
            <br />
          </div>
        </div>
        <div style={{ marginLeft: "50px", marginBottom: "20px" }}>
          <ContractsStats groupStats={groupStats} groupSetIndex={groupSetIndex} />

          <ContractsResume contractInfos={filteredContractInfos} progress={progress} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "flex-start",
            columnGap: "2em",
          }}
        >
          <Input
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
            }}
          />
          <Button
            onClick={() => fixGroupsMutation.mutate({ contractInfosToFix: filteredContractInfos })}
            color="primary"
            variant="contained"
          >
            Synchronize ALL !
          </Button>
          <b>
            <i>{progress}</i>
          </b>
        </div>
        <div>
          <MUIDataTable data={data} columns={columns} options={options} />
        </div>
      </Paper>
    </div>
  );
};

export default SyncProgramGroups;
