import React, { useState } from "react";

import { makeStyles, Typography } from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import Paper from "@material-ui/core/Paper";
import { useMutation, useQuery } from "react-query";
import { useTranslation } from "react-i18next";

import { buildStats, fetchContracts, indexGroupSet } from "./contracts";
import ConfirmButton from "../../shared/ConfirmButton";
import { constructGroupSyncTableColumns } from "./tables";
import ContractsResume from "./ContractsResume";
import ContractsStats from "./ContractsStats";
import PeriodPicker from "../../shared/PeriodPicker";
import CustomFilterList from "../../shared/tables/CustomFilterList";
import PluginRegistry from "../../core/PluginRegistry";
import { onTableChange } from "../../shared/tables/urlParams";

const useStyles = makeStyles((theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(10),
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: "5px",
    paddingLeft: "5px",
    marginBottom: "20px",
  },
  headerTitleHolder: { display: "inline-flex" },
  headerTitle: {
    marginRight: "20px",
  },
  contractsStatsHolder: {
    marginBottom: "20px",
  },
  syncButton: {
    float: "right",
  },
}));

const SyncProgramGroups = (props) => {
  const { history, match } = props;
  const classes = useStyles(props);
  const period = match.params.period;
  const [progress, setProgress] = useState("");
  const [groupSetIndex, setGroupSetIndex] = useState(undefined);
  const { t } = useTranslation();

  const fetchContractsQuery = useQuery(
    ["contracts", period],
    async () => {
      setProgress(t("groupSync.loadingGroups"));
      const groupSetIndex = await indexGroupSet();
      setGroupSetIndex(groupSetIndex);
      const results = await fetchContracts(groupSetIndex, period);
      setProgress(t("groupSync.actionsComputed"));
      return results;
    },
    {
      staleTime: 120000,
    },
  );

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
    setProgress(t("groupSync.updatingGroup", { group: orgUnitGroup.name }));
    const dhis2 = PluginRegistry.extension("core.dhis2");
    const api = await dhis2.api();
    await api.update("organisationUnitGroups/" + orgUnitGroup.id, orgUnitGroup);
    setProgress(t("groupSync.updatedGroup", { group: orgUnitGroup.name }));
  };

  const contractInfosToFixCount = (contractInfosToFix) => {
    const contracts = contractInfosToFix.filter((contract) => contract.actions.some((a) => a.kind !== "keep"));
    return contracts.length;
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

  const options = {
    enableNestedDataAccess: ".",
    filter: true,
    print: false,
    rowsPerPage: 5,
    rowsPerPageOptions: [1, 5, 10, 20, 50, 100, 1000],
    download: false,
    selectableRows: "none",
    elevation: 0,
    onTableChange: onTableChange("", contractInfos),
  };
  const columns = constructGroupSyncTableColumns(contractInfos, { fixGroupsMutation });
  return (
    <div>
      <Paper className={classes.root}>
        <div className={classes.header}>
          <div className={classes.headerTitleHolder}>
            <Typography variant="h6" className={classes.headerTitle}>
              {t("groupSync.title")}
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
                  const newUrl = window.location.href.replace(
                    "/sync/program-groups/" + period,
                    "/sync/program-groups/" + newPeriod,
                  );
                  window.history.pushState({}, "", newUrl);
                  window.location.reload();
                }}
              />
            </div>
          </div>
          <div className={classes.syncButton}>
            <ConfirmButton
              onConfirm={fixGroupsMutation}
              mutateParams={{ contractInfosToFix: contractInfos }}
              message={t("groupSync.areYouSure", { groupCount: contractInfosToFixCount(contractInfos) })}
              disabled={false}
            >
              {t("groupSync.syncAll")}
            </ConfirmButton>
            <div>
              <b>
                <i>{progress}</i>
              </b>
            </div>
          </div>
        </div>
        <div className={classes.contractsStatsHolder}>
          <ContractsStats groupStats={groupStats} groupSetIndex={groupSetIndex} />

          <ContractsResume contractInfos={contractInfos} progress={progress} />
        </div>
        <div>
          <MUIDataTable
            data={contractInfos}
            columns={columns}
            options={options}
            components={{
              TableFilterList: CustomFilterList,
            }}
          />
        </div>
      </Paper>
    </div>
  );
};

export default SyncProgramGroups;
