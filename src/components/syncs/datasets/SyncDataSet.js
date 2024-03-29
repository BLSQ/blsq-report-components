import React, { useState } from "react";
import { useQuery, useMutation } from "react-query";
import MUIDataTable from "mui-datatables";
import PeriodPicker from "../../shared/PeriodPicker";
import PluginRegistry from "../../core/PluginRegistry";
import ConfirmButton from "../../shared/ConfirmButton";
import { constructDataSyncTableColumns } from "./tables";

import { Typography, makeStyles, Paper, CircularProgress } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { fetchDataSets } from "./fetchDataSets";
import { onTableChange } from "../../shared/tables/urlParams";
import CustomFilterList from "../../shared/tables/CustomFilterList";

const useStyles = makeStyles({
  aligned: {
    textAlign: "center",
    verticalAlign: "middle",
  },
  root: { minHeight: "85vh", paddingTop: "14px", paddingLeft: "14px" },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: "5px",
    paddingLeft: "5px",
    marginBottom: "20px",
  },
  headerTitleHolder: { display: "inline-flex" },
  headerTitle: { marginRight: "20px" },
  picker: { padding: "1px" },
  syncButton: { float: "right" },
});

const SyncDataSet = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const dhis2RootUrl = dhis2.baseUrl;
  const DataEntries = PluginRegistry.extension("dataentry.dataEntries");
  const allDataEntries = DataEntries.getAllDataEntries();
  const [loadingStatus, setLoadingStatus] = useState(undefined);

  const period = props.match.params.period;
  const fetchDataSetsQuery = useQuery(["dataSets", period], async () => {
    setLoadingStatus("fetching datasets");
    return await fetchDataSets(allDataEntries, period);
  });

  const dataElementsById = fetchDataSetsQuery?.data?.dataElementsById;
  const contractsByDataEntryCode = fetchDataSetsQuery?.data?.contractsByDataEntryCode;
  const orgunitMissingCount = fetchDataSetsQuery?.data?.missingOrgunitsCount;

  const updateOu = async (myDataSet, missingOrgunits) => {
    setLoadingStatus(`Updating ${myDataSet.name}`);
    const api = await dhis2.api();
    const dataSet = await api.get("dataSets/" + myDataSet.id, {
      fields: ":all",
    });
    const dataSetOrgunits = new Set(dataSet.organisationUnits.map((ou) => ou.id));
    for (let missingOu of missingOrgunits) {
      if (!dataSetOrgunits.has(missingOu.id)) {
        dataSet.organisationUnits.push(missingOu);
      }
    }
    await api.update("dataSets/" + dataSet.id, dataSet);
  };

  const addAllMissingOusMutation = useMutation(async () => {
    const contracts = Object.values(contractsByDataEntryCode);
    for (let contractGroups of contracts) {
      for (let contract of contractGroups) {
        if (contract.missingOrgunits.length > 0) {
          await updateOu(contract.dataSet, contract.missingOrgunits);
        }
      }
    }
    await fetchDataSetsQuery.refetch();
  });

  const loading = fetchDataSetsQuery.isLoading || addAllMissingOusMutation.isLoading;

  const addSingleMissingOuMutation = useMutation(async ({ contract }) => {
    await updateOu(contract.dataSet, contract.missingOrgunits);
    await fetchDataSetsQuery.refetch();
  });

  const addMissingDe = async (dataEntry) => {
    const missing = contractsByDataEntryCode[dataEntry.code][0].missingDataElements;
    const api = await dhis2.api();
    const dataSet = await api.get("dataSets/" + dataEntry.dataSetId, {
      fields: ":all",
    });
    const dataSetDataElements = new Set(dataSet.dataSetElements.map((dse) => dse.dataElement.id));
    for (let missingDeId of missing) {
      if (!dataSetDataElements.has(missingDeId)) {
        dataSet.dataSetElements.push({
          dataElement: { id: missingDeId },
          categoryCombo: dataSet.categoryCombo,
          dataSet: { id: dataSet.id },
        });
      }
    }
    try {
      await api.update("dataSets/" + dataSet.id, dataSet);
    } catch (error) {
      alert("Something went wrong was not able to update the dataset " + JSON.stringify(error));
    }
    fetchDataSetsQuery.refetch();
  };

  const data = allDataEntries.map((dataEntry) => {
    const contracts = contractsByDataEntryCode
      ? contractsByDataEntryCode && contractsByDataEntryCode[dataEntry.code]
      : undefined;
    let actionsNeeded = [];
    if (contracts && contracts.some((c) => c.missingOrgunits.length !== 0)) {
      actionsNeeded.push("add missing orgunits");
    } else if (contracts && contracts.some((c) => c.missingDataElements.length !== 0)) {
      actionsNeeded.push("add missing data elements");
    }
    return {
      dataEntry,
      contracts: contracts,
      actionsNeeded: actionsNeeded,
    };
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
    onTableChange: onTableChange("", data),
  };
  const columns = constructDataSyncTableColumns(data, {
    loading,
    dhis2RootUrl,
    dataElementsById,
    addSingleMissingOuMutation,
    addMissingDe,
    t,
  });

  return (
    <Paper className={classes.root}>
      <div>
        <div className={classes.header}>
          <div className={classes.headerTitleHolder}>
            <Typography variant="h6" className={classes.headerTitle}>
              {t("dataSync.title")}
            </Typography>
            <div classes={classes.picker}>
              <PeriodPicker
                disableInputLabel={true}
                period={period}
                periodDelta={{
                  before: 5,
                  after: 5,
                }}
                onPeriodChange={(newPeriod) => {
                  const newUrl = window.location.href.replace(
                    "/sync/datasets/" + period,
                    "/sync/datasets/" + newPeriod,
                  );
                  window.history.pushState({}, "", newUrl);
                  window.location.reload();
                }}
              />
            </div>
          </div>
          <div className={classes.syncButton}>
            <ConfirmButton
              onConfirm={addAllMissingOusMutation}
              message={t("dataSync.areYouSure", { orgunitCount: orgunitMissingCount })}
              disabled={loading}
            >
              {t("dataSync.addAllOrgunits")} {loading && loadingStatus ? <CircularProgress size={15} /> : ""}
            </ConfirmButton>
          </div>
        </div>
      </div>
      <div>
        <MUIDataTable
          data={data}
          columns={columns}
          options={options}
          components={{
            TableFilterList: CustomFilterList,
          }}
        />
      </div>
    </Paper>
  );
};

export default SyncDataSet;
