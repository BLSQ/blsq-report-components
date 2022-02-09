import PluginRegistry from "../../core/PluginRegistry";
import { useQuery, useMutation } from "react-query";
import { makeStyles, Typography, Button, Input } from "@material-ui/core";
import _ from "lodash";
import React, { useState } from "react";
import MUIDataTable from "mui-datatables";
import PeriodPicker from "../../shared/PeriodPicker";
import Paper from "@material-ui/core/Paper";
import { fetchContracts, indexGroupSet, buildStats } from "./contracts";
import { constructGroupSyncTableColumns } from "./tables";

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
          <GroupSetStats groupStats={stats} />
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

  const fixGroups = async (contractInfosToFix) => {
    const dhis2 = PluginRegistry.extension("core.dhis2");
    const api = await dhis2.api();

    const modifiedGroups = {};
    for (let contractInfo of contractInfosToFix) {
      const actions = contractInfo.actions.filter((a) => a.kind !== "keep");
      for (const action of actions) {
        if (modifiedGroups[action.group.id] === undefined) {
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
    await fetchContractsQuery.refetch();
  };

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
  const columns = constructGroupSyncTableColumns(data, {fixGroups});
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
          <Button onClick={() => fixGroups(filteredContractInfos)} color="primary" variant="contained">
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
