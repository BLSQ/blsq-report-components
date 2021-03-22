import React, { useEffect, useState } from "react";

import { PluginRegistry } from "@blsq/blsq-report-components";
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
          href={
            dhis2RootUrl +
            "/dhis-web-maintenance/index.html#/list/dataSetSection/dataSet"
          }
        >
          {displayName}
        </a>
        {publicWriteAccess && (
          <span style={{ color: "red" }}> public ! write access !!"</span>
        )}
        {metadataWriteAccess && (
          <span style={{ color: "red" }}> metadata write access !!"</span>
        )}
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
  const [contractsByDataEntryCode, setContractsByDataEntryCode] = useState(
    undefined
  );

  const period = props.period;

  const fetchDataSets = async () => {
    setLoading(true);
    const api = await dhis2.api();
    const dataElements = _.keyBy(
      (await api.get("dataElements", { paging: false, fields: "id,name" }))
        .dataElements,
      (de) => de.id
    );
    setDataElementsById(dataElements);
    const ds = await api.get("dataSets", {
      filter: [
        "id:in:[" + allDataEntries.map((d) => d.dataSetId).join(",") + "]",
      ],
      paging: false,
      fields:
        ":all,dataSetElements[dataElement[id,name]]organisationUnits[id,name],workflow[:all]",
    });
    const dataSetsById = _.keyBy(ds.dataSets, (d) => d.id);
    setDataSetsById(dataSetsById);

    const contractService = PluginRegistry.extension("contracts.service");
    const contracts = await contractService.findAll();

    const activeCotnracts = contracts.filter((contract) =>
      contract.matchPeriod(period)
    );
    const contractsByDataEntryCode = {};
    for (let dataEntry of allDataEntries) {
      const dataEntryContracts = activeCotnracts.filter((activeContract) =>
        dataEntry.contracts.some((contractFilter) =>
          contractFilter.every((code) => activeContract.codes.includes(code))
        )
      );
      const dataSet = dataSetsById[dataEntry.dataSetId];
      const dataSetOrgunits = new Set(
        dataSet.organisationUnits.map((ou) => ou.id)
      );
      const missingOrgunits = dataEntryContracts
        .map((c) => c.orgUnit)
        .filter((ou) => !dataSetOrgunits.has(ou.id));

      let expectedDataElements = [];
      const missingDataElements = [];
      if (dataEntry.hesabuInputs) {
        const project_descriptor = project(period);
        const payment =
          project_descriptor.payment_rules[dataEntry.hesabuPayment];
        const hesabuPackage = payment.packages[dataEntry.hesabuPackage];
        const hesabuInputs = dataEntry.hesabuInputs;
        const expectedDataElements = hesabuPackage.activities.flatMap(
          (activity) => dataEntry.hesabuInputs.map((state) => activity[state])
        );
        const dataSetElements = new Set(
          dataSet.dataSetElements.map((dse) => dse.dataElement.id)
        );
        for (let expectedDE of expectedDataElements) {
          if (!dataSetElements.has(expectedDE)) {
            missingDataElements.push(expectedDE);
          }
        }
      }

      contractsByDataEntryCode[dataEntry.code] = {
        activeContracts: dataEntryContracts,
        missingOrgunits: missingOrgunits,
        expectedDataElements: expectedDataElements,
        missingDataElements: missingDataElements,
      };
    }
    setContractsByDataEntryCode(contractsByDataEntryCode);
    setLoading(false);
  };

  useEffect(() => {
    fetchDataSets();
  }, []);

  const addMissingOu = async (dataEntry) => {
    setLoading(true);
    const missing = contractsByDataEntryCode[dataEntry.code].missingOrgunits;

    const api = await dhis2.api();
    const dataSet = await api.get("dataSets/" + dataEntry.dataSetId, {
      fields: ":all",
    });
    const dataSetOrgunits = new Set(
      dataSet.organisationUnits.map((ou) => ou.id)
    );
    for (let missingOu of missing) {
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
    const missing =
      contractsByDataEntryCode[dataEntry.code].missingDataElements;

    const api = await dhis2.api();
    const dataSet = await api.get("dataSets/" + dataEntry.dataSetId, {
      fields: ":all",
    });
    const dataSetDataElements = new Set(
      dataSet.dataSetElements.map((dse) => dse.dataElement.id)
    );
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
      alert(
        "Something went wrong was not able to update the dataset " +
          JSON.stringify(error)
      );
    }
    setLoading(false);
    fetchDataSets();
  };

  return (
    <Paper style={{ minHeight: "85vh" }}>
      <Typography variant="h4">
        Synchronisation for period : {period}
      </Typography>
      <br></br>
      <Table>
        <TableHead>
          <TableRow>
            <th width="10%">Data entry</th>
            <th width="30%">Dataset</th>
            <th width="10%">Assigned to</th>
            <th width="10%">Active contracts</th>
            <th width="20%">Actions</th>
            <th width="20%">Access</th>
          </TableRow>
        </TableHead>

        <TableBody>
          {allDataEntries.map((dataEntry) => {
            const dataSet = dataSetsById && dataSetsById[dataEntry.dataSetId];
            const contracts =
              contractsByDataEntryCode &&
              contractsByDataEntryCode[dataEntry.code];
            return (
              <TableRow key={dataEntry.code}>
                <TableCell>
                  {dataEntry.name}
                  <br />
                  <code>
                    {dataEntry.code} <br></br> {dataSet && dataSet.periodType}{" "}
                    VS {dataEntry.frequency}
                  </code>
                </TableCell>
                <TableCell title={dataEntry.dataSetId}>
                  {dataSetsById == undefined && dataEntry.dataSetId}
                  {dataSet && (
                    <div>
                      {dataSet.name}&nbsp; ({dataSet.organisationUnits.length}){" "}
                      <br></br>
                      <code>
                        <a
                          href={
                            dhis2RootUrl +
                            "/dhis-web-maintenance/index.html#/edit/dataSetSection/dataSet/" +
                            dataEntry.dataSetId
                          }
                          target="_blank"
                          rel="noopener noreferrer" 
                        >
                          {dataEntry.dataSetId}
                        </a>{" "}
                        {dataSet.workflow && " - " + dataSet.workflow.name}
                        {dataSet.workflow == undefined && (
                          <span style={{ color: "red" }}>
                            no data approval configured
                          </span>
                        )}
                      </code>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {dataEntry.contracts.map((contract, index) => (
                    <div>
                      ( {contract.join(" AND ")} ){" "}
                      {index + 1 < dataEntry.contracts.length && "OR"}
                    </div>
                  ))}
                </TableCell>
                <TableCell className={classes.aligned}>
                  {contracts && contracts.activeContracts.length}
                </TableCell>

                <TableCell>
                  {!loading && (
                    <Button
                      onClick={() => addMissingOu(dataEntry)}
                      title={
                        contracts &&
                        contracts.missingOrgunits
                          .map((ou) => ou.name)
                          .join(" , ")
                      }
                      disabled={
                        contracts && contracts.missingOrgunits.length == 0
                      }
                    >
                      Add {contracts && contracts.missingOrgunits.length}{" "}
                      missing OrgUnits to dataset
                    </Button>
                  )}
                  {!loading && (
                    <Button
                      onClick={() => addMissingDe(dataEntry)}
                      title={
                        contracts &&
                        contracts.missingDataElements
                          .map((de) =>
                            dataElementsById[de]
                              ? dataElementsById[de].name
                              : de
                          )
                          .join(" , ")
                      }
                      disabled={
                        contracts && contracts.missingDataElements.length == 0
                      }
                    >
                      Add {contracts && contracts.missingDataElements.length}{" "}
                      DataElements to dataset
                    </Button>
                  )}
                  {dataEntry.hesabuInputs == undefined && <div style={{color: "red"}}>No hesabuInputs configured in dataentries.json</div>}
                </TableCell>
                <TableCell>
                  <div style={{ display: "block" }}>
                    {dataSet && (
                      <>
                        <AccessDisplay
                          access={dataSet.publicAccess}
                          displayName={"Public"}
                          dhis2RootUrl={dhis2RootUrl}
                        ></AccessDisplay>
                      </>
                    )}
                    {dataSet &&
                      dataSet.userGroupAccesses.map((uga) => (
                        <AccessDisplay
                          key={uga.displayName}
                          access={uga.access}
                          displayName={uga.displayName}
                          dhis2RootUrl={dhis2RootUrl}
                        ></AccessDisplay>
                      ))}
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
