import React from "react";
import { Button } from "@material-ui/core";

export const constructGroupSyncTableColumns = (data, { fixGroupsMutation }) => {
  return [
    {
      name: "orgUnit.overview",
      label: "Org unit",
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          return (
            <span>
              {info.orgUnit.name} <br />
              <code>
                {" "}
                {info.orgUnit.ancestors.slice(1, info.orgUnit.ancestors.length - 1).map((a, index) => (
                  <span key={"ancestor-" + index}>
                    {a.name} {index < info.orgUnit.ancestors.length - 3 ? " > " : ""}
                  </span>
                ))}
              </code>
              <br /> contracts : {info.orgUnitContracts.length}
            </span>
          );
        },
      },
    },
    {
      name: "orgUnit.selectedContract",
      label: "Selected contract",
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          return (
            <span>
              {info.contractForPeriod && (
                <div
                  style={{
                    color: info.contractedForPeriod ? "" : "grey",
                  }}
                >
                  {Array.from(new Set(info.contractForPeriod.codes)).join(", ")} <br />
                  <a target="_blank" href={"./index.html#/contracts/" + info.orgUnit.id}>
                    {info.contractForPeriod.startPeriod} - {info.contractForPeriod.endPeriod}
                  </a>
                </div>
              )}
            </span>
          );
        },
      },
    },
    {
      name: "orgUnit.proposedChanges",
      label: "Proposed changes",
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          return (
            <span>
              {info.actions.map((action) => (
                <span
                  key={action.kind + "-" + action.group.name}
                  style={{
                    textDecoration: action.kind === "remove" ? "line-through" : "",
                    color: action.kind === "keep" ? "grey" : "",
                  }}
                  title={action.kind + " " + action.group.name}
                >
                  {action.group.name} <br />
                </span>
              ))}
            </span>
          );
        },
      },
    },
    {
      name: "orgUnit.warnings",
      label: "Warnings",
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          return <span>{info.warnings ? info.warnings.join("\n") : "no warnings"}</span>;
        },
      },
    },
    {
      name: "orgUnit.actions",
      label: "Actions",
      options: {
        filter: true,
        sort: true,
        customBodyRenderLite: (dataIndex) => {
          const info = data[dataIndex];
          const contractInfosToFix = [info];
          return (
            <span>
              {info && !info.synchronized && (
                <Button
                  onClick={() => {
                    fixGroupsMutation.mutate({ contractInfosToFix });
                  }}
                >
                  Fix me !
                </Button>
              )}
            </span>
          );
        },
      },
    },
  ];
};
