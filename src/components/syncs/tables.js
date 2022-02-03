import React from "react";
import { Button } from "@material-ui/core";
import { AccessDisplay } from "./accessDisplay";

export const constructDataEntryName = (dataEntry) => {
  return (
    <span>
      {dataEntry.name}
      <br />
      <code>
        {dataEntry.code} <br /> {dataEntry.frequency}
      </code>
    </span>
  );
};

export const constructDataEntryAssignedTo = (dataEntry) => {
  return (
    <span>
      {dataEntry.contracts.map((contract, index) => (
        <div>
          ( {contract.join(" AND ")} ) {index + 1 < dataEntry.contracts.length && "OR"}
        </div>
      ))}
    </span>
  );
};

export const constructDataEntryActiveContracts = (contractsByDataEntryCode, dataEntry) => {
  const contracts = contractsByDataEntryCode && contractsByDataEntryCode[dataEntry.code];
  return (
    <span>{contracts && contracts[0] && contracts[0].activeContracts && contracts[0].activeContracts.length}</span>
  );
};

export const constructDataEntryActions = (contractsByDataEntryCode, dataEntry, loading) => {
  const contracts = contractsByDataEntryCode && contractsByDataEntryCode[dataEntry.code];
  return (
    <div style={{ display: "block" }}>
      {!loading &&
        contracts &&
        contracts.map((contract) => (
          <Button
            style={{ textAlign: "left" }}
            onClick={() => addSingleMissingOu(contract.dataSet, contract.missingOrgunits)}
            title={contract.missingOrgunits.map((ou) => ou.name).join(" , ")}
            disabled={contract.missingOrgunits.length == 0}
          >
            Add {contract.missingOrgunits.length} missing OrgUnits to dataset <br /> {contract.dataSet.name}
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
      {dataEntry.hesabuPackage && dataEntry.hesabuInputs === undefined && (
        <div style={{ color: "red" }}>No hesabuInputs configured in dataentries.json</div>
      )}
    </div>
  );
};

export const constructAccessAndApprovalWorkflow = (contractsByDataEntryCode, dataEntry, dhis2RootUrl) => {
  const contracts = contractsByDataEntryCode && contractsByDataEntryCode[dataEntry.code];
  return (
    <div style={{ display: "block" }}>
      {contracts &&
        contracts.map((contract) => {
          return (
            <>
              <b style={{ color: "grey" }}>{contract.dataSet.name}</b>{" "}
              <a
                href={
                  dhis2RootUrl + "/dhis-web-maintenance/index.html#/edit/dataSetSection/dataSet/" + contract.dataSet.id
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <code>{contract.dataSet.id}</code>
              </a>{" "}
              <br />
              {contract.dataSet.workflow &&
                "Data approval : " + contract.dataSet.workflow.name + " " + contract.dataSet.workflow.periodType}
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
              <br />
            </>
          );
        })}
    </div>
  );
};

export const constructDataForTable = (contractsByDataEntryCode, dataEntry, loading, dhis2RootUrl) => {
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
};
