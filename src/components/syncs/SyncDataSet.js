import React, { useEffect, useState } from "react";
import PortalHeader from "../shared/PortalHeader";
import PeriodPicker from "../shared/PeriodPicker";

import PluginRegistry from "../core/PluginRegistry";

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

const AccessDisplay = ({ access, displayName, dhis2RootUrl }) => {
  const publicWriteAccess = access.includes("w") && displayName == "Public";
  const metadataWriteAccess = access[1] == "w";
  return (
    <div>
      <span style={{ fontFamily: "monospace" }}>{access}&nbsp;</span>
      <span>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={dhis2RootUrl + "/dhis-web-maintenance/index.html#/list/dataSetSection/dataSet"}
        >
          {displayName}
        </a>
        {publicWriteAccess && <span style={{ color: "red" }}> public ! write access !!"</span>}
        {metadataWriteAccess && <span style={{ color: "red" }}> metadata write access !!"</span>}
      </span>
    </div>
  );
};

const SyncDataSet = (props) => {
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const dhis2RootUrl = dhis2.baseUrl;

  const project = PluginRegistry.extension("hesabu.project");
  const DataEntries = PluginRegistry.extension("dataentry.dataEntries");
  const classes = useStyles(props);
  const allDataEntries = DataEntries.getAllDataEntries();
  const [loading, setLoading] = useState(undefined);
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

  const addMissingOu = async (myDataSet, missingOrgunits) => {
    setLoading(true);
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

  return (
    <Paper style={{ minHeight: "85vh", paddingTop: "14px", paddingLeft: "14px"}}>
      <div>
        <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "flex-start", paddingTop: "5px", paddingLeft:"5px", marginBottom: "20px" }}>
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
            ></PeriodPicker>
          </div>
        </div>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <th width="10%">Data entry</th>
            <th width="5%">Assigned to</th>
            <th width="10%">Active contracts</th>
            <th width="20%">Actions</th>
            <th width="40%">Access & approval workflow</th>
          </TableRow>
        </TableHead>

        <TableBody>
          {allDataEntries.map((dataEntry) => {
            const dataSet = dataSetsById && dataSetsById[dataEntry.dataSetId];
            const contracts = contractsByDataEntryCode && contractsByDataEntryCode[dataEntry.code];
            return (
              <TableRow key={dataEntry.code}>
                <TableCell>
                  {dataEntry.name}
                  <br />
                  <code>
                    {dataEntry.code} <br></br> {dataEntry.frequency}
                  </code>
                </TableCell>
                <TableCell>
                  {dataEntry.contracts.map((contract, index) => (
                    <div>
                      ( {contract.join(" AND ")} ) {index + 1 < dataEntry.contracts.length && "OR"}
                    </div>
                  ))}
                </TableCell>
                <TableCell className={classes.aligned}>
                  {contracts && contracts[0] && contracts[0].activeContracts && contracts[0].activeContracts.length}
                </TableCell>

                <TableCell>
                  {!loading &&
                    contracts &&
                    contracts.map((contract) => (
                      <Button
                        style={{ textAlign: "left" }}
                        onClick={() => addMissingOu(contract.dataSet, contract.missingOrgunits)}
                        title={contract.missingOrgunits.map((ou) => ou.name).join(" , ")}
                        disabled={contract.missingOrgunits.length == 0}
                      >
                        Add {contract.missingOrgunits.length} missing OrgUnits to dataset <br></br>{" "}
                        {contract.dataSet.name}
                      </Button>
                    ))}

                  {!loading && dataEntry.hesabuInputs && contracts && contracts[0] && (
                    <span
                      title={
                        contracts &&
                        "missing : " +
                          contracts[0].missingDataElements
                            .map((de) => (dataElementsById[de] ? dataElementsById[de].name : de))
                            .join(" , ") +
                          "\n\n based on : \n" +
                          dataEntry.hesabuInputs.join(" , ") +
                          "\n\n is supposed to contain : \n" +
                          contracts[0].expectedDataElements
                            .map((de) => (dataElementsById[de] ? dataElementsById[de].name : de))
                            .join(" ,  )")
                      }
                    >
                      <Button
                        onClick={() => addMissingDe(dataEntry)}
                        disabled={contracts && contracts[0].missingDataElements.length == 0}
                      >
                        Add {contracts && contracts[0].missingDataElements.length} DataElements to dataset
                      </Button>
                    </span>
                  )}
                  {dataEntry.hesabuPackage && dataEntry.hesabuInputs == undefined && (
                    <div style={{ color: "red" }}>No hesabuInputs configured in dataentries.json</div>
                  )}
                </TableCell>
                <TableCell>
                  <div style={{ display: "block" }}>
                    {contracts &&
                      contracts.map((contract) => {
                        return (
                          <>
                            <b style={{ color: "grey" }}>{contract.dataSet.name}</b>{" "}
                            <a
                              href={
                                dhis2RootUrl +
                                "/dhis-web-maintenance/index.html#/edit/dataSetSection/dataSet/" +
                                contract.dataSet.id
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <code>{contract.dataSet.id}</code>
                            </a>{" "}
                            <br></br>
                            {contract.dataSet.workflow && "Data approval : " + contract.dataSet.workflow.name+" "+contract.dataSet.workflow.periodType}
                            {contract.dataSet.workflow == undefined && (
                              <span style={{ color: "red" }}>no data approval configured</span>
                            )}
                            <AccessDisplay
                              access={contract.dataSet.publicAccess}
                              displayName={"Public"}
                              dhis2RootUrl={dhis2RootUrl}
                            />
                            {contract.dataSet.userGroupAccesses.map((uga) => (
                              <AccessDisplay
                                key={uga.displayName}
                                access={uga.access}
                                displayName={uga.displayName}
                                dhis2RootUrl={dhis2RootUrl}
                              />
                            ))}
                            <br></br>
                          </>
                        );
                      })}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SyncDataSet;
