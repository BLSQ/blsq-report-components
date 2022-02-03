import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import PortalHeader from "../shared/PortalHeader";
import PeriodPicker from "../shared/PeriodPicker";

import PluginRegistry from "../core/PluginRegistry";

import {
  constructDataEntryName,
  constructDataEntryAssignedTo,
  constructDataEntryActiveContracts,
  constructDataEntryActions,
  constructAccessAndApprovalWorkflow,
} from "./tables";

import { AccessDisplay } from "./accessDisplay";

import _ from "lodash";
import {
  Button,
  Typography,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@material-ui/core";

const useStyles = makeStyles({
  aligned: {
    textAlign: "center",
    verticalAlign: "middle",
  },
});

const SyncDataSet = (props) => {
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const dhis2RootUrl = dhis2.baseUrl;

  const project = PluginRegistry.extension("hesabu.project");
  const DataEntries = PluginRegistry.extension("dataentry.dataEntries");
  const classes = useStyles(props);
  const allDataEntries = DataEntries.getAllDataEntries();
  const [loading, setLoading] = useState(undefined);
  const [loadingStatus, setLoadingStatus] = useState(undefined);
  const [dataElementsById, setDataElementsById] = useState(undefined);
  const [dataSetsById, setDataSetsById] = useState(undefined);
  const [contractsByDataEntryCode, setContractsByDataEntryCode] = useState(undefined);

  const period = props.match.params.period;

  const fetchDataSets = async () => {
    setLoading(true);
    const api = await dhis2.api();
    const dataElements = _.keyBy(
      (await api.get("dataElements", { paging: false, fields: "id,name" })).dataElements,
      (de) => de.id,
    );
    setDataElementsById(dataElements);
    const dataSetIds = allDataEntries.flatMap((d) => (d.dataSetId ? [d.dataSetId] : d.dataSetIds));
    const ds = await api.get("dataSets", {
      filter: ["id:in:[" + dataSetIds.join(",") + "]"],
      paging: false,
      fields: ":all,dataSetElements[dataElement[id,name]]organisationUnits[id,name],workflow[:all]",
    });
    const dataSetsById = _.keyBy(ds.dataSets, (d) => d.id);
    setDataSetsById(dataSetsById);

    const contractService = PluginRegistry.extension("contracts.service");
    const contracts = await contractService.findAll();

    const activeCotnracts = contracts.filter((contract) => contract.matchPeriod(period));
    const contractsByDataEntryCode = {};
    for (let dataEntry of allDataEntries) {
      const dataEntryContracts = activeCotnracts.filter((activeContract) =>
        dataEntry.contracts.some((contractFilter) =>
          contractFilter.every((code) => activeContract.codes.includes(code)),
        ),
      );
      const dataSets = dataEntry.dataSetId
        ? [dataSetsById[dataEntry.dataSetId]]
        : dataEntry.dataSetIds
        ? dataEntry.dataSetIds.map((id) => dataSetsById[id])
        : [];
      const results = [];
      for (let dataSet of dataSets) {
        contractsByDataEntryCode[dataEntry.code];
        const dataSetOrgunits = new Set(dataSet.organisationUnits.map((ou) => ou.id));
        const missingOrgunits = dataEntryContracts.map((c) => c.orgUnit).filter((ou) => !dataSetOrgunits.has(ou.id));

        let expectedDataElements = [];
        const missingDataElements = [];
        if (dataEntry.hesabuInputs) {
          const project_descriptor = project(period);
          const payment = project_descriptor.payment_rules[dataEntry.hesabuPayment];
          const hesabuPackage = payment.packages[dataEntry.hesabuPackage];
          expectedDataElements = hesabuPackage.activities
            .flatMap((activity) => dataEntry.hesabuInputs.map((state) => activity[state]))
            .filter((de) => de);
          const dataSetElements = new Set(dataSet.dataSetElements.map((dse) => dse.dataElement.id));
          for (let expectedDE of expectedDataElements) {
            if (expectedDE && !dataSetElements.has(expectedDE)) {
              missingDataElements.push(expectedDE);
            }
          }
        }

        results.push({
          dataSet: dataSet,
          activeContracts: dataEntryContracts,
          missingOrgunits: missingOrgunits,
          expectedDataElements: expectedDataElements,
          missingDataElements: missingDataElements,
        });
      }
      contractsByDataEntryCode[dataEntry.code] = results;
    }
    setContractsByDataEntryCode(contractsByDataEntryCode);
    setLoading(false);
  };

  useEffect(() => {
    fetchDataSets();
  }, []);

  const updateOu = async (myDataSet, missingOrgunits) => {
    setLoadingStatus(`Updating ${myDataSet.name}`);
    console.log(`Updating ${myDataSet.name}`);
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

  const addAllMissingOus = async () => {
    setLoading(true);
    const contracts = Object.values(contractsByDataEntryCode);
    for (let contractGroups of contracts) {
      for (let contract of contractGroups) {
        if (contract.missingOrgunits.length > 0) {
          await updateOu(contract.dataSet, contract.missingOrgunits);
        }
      }
    }
    setLoading(false);
    fetchDataSets();
  };

  const addSingleMissingOu = async (myDataSet, missingOrgunits) => {
    setLoading(true);
    await updateOu(myDataSet, missingOrgunits);
    setLoading(false);
    fetchDataSets();
  };

  const addMissingDe = async (dataEntry) => {
    setLoading(true);
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
    setLoading(false);
    fetchDataSets();
  };

  const columns = ["Data Entry", "Assigned To", "Active Contracts", "Actions", "Access & Approval Workflow"];
  const data = allDataEntries.map((dataEntry) => {
    // return constructDataForTable(contractsByDataEntryCode, dataEntry, loading, dhis2RootUrl);
    const dataEntryName = constructDataEntryName(dataEntry);
    const dataEntryAssignedTo = constructDataEntryAssignedTo(dataEntry);
    const dataEntryActiveContracts = constructDataEntryActiveContracts(contractsByDataEntryCode, dataEntry);
    const dataEntryActions = constructDataEntryActions(contractsByDataEntryCode, dataEntry, loading);
    const dataEntryAccessAndApprovalWorkflow = constructAccessAndApprovalWorkflow(
      contractsByDataEntryCode,
      dataEntry,
      dhis2RootUrl,
    );
    return [
      dataEntryName,
      dataEntryAssignedTo,
      dataEntryActiveContracts,
      dataEntryActions,
      dataEntryAccessAndApprovalWorkflow,
    ];
  });

  return (
    <Paper style={{ minHeight: "85vh", paddingTop: "14px", paddingLeft: "14px" }}>
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            justifyContent: "flex-start",
            paddingTop: "5px",
            paddingLeft: "5px",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            Dataset Synchronisation for
          </Typography>
          <div style={{ padding: "1px" }}>
            <PeriodPicker
              disableInputLabel={true}
              period={period}
              periodDelta={{
                before: 5,
                after: 5,
              }}
              onPeriodChange={(newPeriod) => {
                props.history.push("/sync/datasets/" + newPeriod);
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <Button onClick={addAllMissingOus} color="primary">
          Synchronize all {loading && loadingStatus}
        </Button>
      </div>
        <MUIDataTable title={"testing"} data={data} columns={columns} />
    </Paper>
  );
};

export default SyncDataSet;
