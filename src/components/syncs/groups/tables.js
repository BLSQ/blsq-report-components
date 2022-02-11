import React from "react";
import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";

export const constructGroupSyncTableColumns = (data, { fixGroupsMutation }) => {
  const { t } = useTranslation();
  return [
    {
      name: "orgUnit.name",
      label: "Orgunit",
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
      name: "selectedContract",
      label: t("groupSync.selectedContract"),
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
      name: "proposedChanges",
      label: t("groupSync.proposedChanges"),
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
      label: t("groupSync.warnings"),
      options: {
        filter: false,
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
        filter: false,
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
                  {t("groupSync.fixMe")}
                </Button>
              )}
            </span>
          );
        },
      },
    },
    {
      name: "synchronizedStatus",
      label: "Synchronized status",
      options: {
        filter: true,
        sort: true,
        display: false,
      },
    },
  ];
};
