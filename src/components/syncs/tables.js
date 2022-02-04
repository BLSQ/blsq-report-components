import React from "react";
import { useMutation } from "react-query";
import { Button } from "@material-ui/core";
import AccessDisplay from "./AccessDisplay";

export const constructDataSyncTableColumns = (
  data,
  { loading, dhis2RootUrl, dataElementsById, addSingleMissingOuMutation, addMissingDe, t },
) => {
  return [
    {
      name: "dataEntry.code",
      label: t("dataEntry.dataEntries"),
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          return (
            <span>
              {info.dataEntry.name}
              <br />
              <code>
                {info.dataEntry.code} <br /> {info.dataEntry.frequency}
              </code>
            </span>
          );
        },
      },
    },
    {
      name: "dataEntry.assignedTo",
      label: t("dataEntry.assignedTo"),
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          return (
            <span>
              {info.dataEntry.contracts.map((contract, index) => (
                <div>
                  ( {contract.join(" AND ")} ) {index + 1 < info.dataEntry.contracts.length && "OR"}
                </div>
              ))}
            </span>
          );
        },
      },
    },
    {
      name: "dataEntry.activeContracts",
      label: t("dataEntry.activeContracts"),
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          const contracts = info.contracts;
          return (
            <span>
              {contracts && contracts[0] && contracts[0].activeContracts && contracts[0].activeContracts.length}
            </span>
          );
        },
      },
    },
    {
      name: "dataEntry.actions",
      label: t("dataEntry.actions"),
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          const contracts = info.contracts;
          return (
            <div style={{ display: "block" }}>
              {!loading &&
                contracts &&
                contracts.map((contract) => (
                  <div key={contract.dataSet.id}>
                    <Button
                      style={{ textAlign: "left" }}
                      onClick={() => {
                        addSingleMissingOuMutation.mutate({ contract });
                      }}
                      title={contract.missingOrgunits.map((ou) => ou.name).join(" , ")}
                      disabled={contract.missingOrgunits.length === 0}
                    >
                      Add {contract.missingOrgunits.length} missing OrgUnits to dataset <br /> {contract.dataSet.name}
                    </Button>
                  </div>
                ))}
              {!loading && info.dataEntry.hesabuInputs && contracts && contracts[0] && (
                <span
                  title={
                    contracts &&
                    "missing : " +
                      contracts[0].missingDataElements
                        .map((de) => (dataElementsById[de] ? dataElementsById[de].name : de))
                        .join(" , ") +
                      "\n\n based on : \n" +
                      info.dataEntry.hesabuInputs.join(" , ") +
                      "\n\n is supposed to contain : \n" +
                      contracts[0].expectedDataElements
                        .map((de) => (dataElementsById[de] ? dataElementsById[de].name : de))
                        .join(" ,  )")
                  }
                >
                  <Button
                    onClick={() => addMissingDe(info.dataEntry)}
                    disabled={contracts && contracts[0].missingDataElements.length === 0}
                  >
                    Add {contracts && contracts[0].missingDataElements.length} DataElements to dataset
                  </Button>
                </span>
              )}
              {info.dataEntry.hesabuPackage && info.dataEntry.hesabuInputs === undefined && (
                <div style={{ color: "red" }}>No hesabuInputs configured in dataentries.json</div>
              )}
            </div>
          );
        },
      },
    },
    {
      name: "dataEntry.accessAndApprovalWorkflow",
      label: t("dataEntry.accessAndApproval"),
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          const contracts = info.contracts;
          return (
            <div style={{ display: "block" }}>
              {contracts &&
                contracts.map((contract) => {
                  return (
                    <div key={contract.dataSet.id}>
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
                      <br />
                      {contract.dataSet.workflow &&
                        "Data approval : " +
                          contract.dataSet.workflow.name +
                          " " +
                          contract.dataSet.workflow.periodType}
                      {contract.dataSet.workflow === undefined && (
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
                    </div>
                  );
                })}
            </div>
          );
        },
      },
    },
  ];
};
