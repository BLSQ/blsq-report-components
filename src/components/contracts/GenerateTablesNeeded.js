import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import PluginRegistry from "../core/PluginRegistry";
import GenerateTablesButton from "./GenerateTablesButton";

const GenerateTablesNeeded = ({ orgUnit }) => {
  const { t } = useTranslation();
  const generateTablesNeededQuery = useQuery(
    ["systemInfo", orgUnit?.id],
    async () => {
      if (orgUnit == undefined) {
        return;
      }
      const dhis2 = PluginRegistry.extension("core.dhis2");
      const api = await dhis2.api();
      const lastAnalytics = (await api.get("system/info")).lastAnalyticsTableSuccess;
      const lastResourceTables = Object.values(await api.get("system/tasks/RESOURCE_TABLE"));
      const lastResourceTablesTimings = lastResourceTables
        .flatMap((it) => it)
        .filter((step) => step.completed)
        .map((step) => step.time)
        .concat([lastAnalytics])
        .sort();
      const lastResourceTablesTiming = lastResourceTablesTimings[lastResourceTablesTimings.length - 1];
      const tooRecent = orgUnit.created >= lastResourceTablesTiming;
      return tooRecent;
    },
    {
      enabled: !!orgUnit,
    },
  );
  return (
    <div>
      <div style={{ color: generateTablesNeededQuery.data ? "darkorange" : "" }}>
        {generateTablesNeededQuery.isLoading && "checking resources tables"}
        {generateTablesNeededQuery.data && t("contracts.resourceTables.generateHint")}
      </div>
      <div>{generateTablesNeededQuery.data && <GenerateTablesButton creationDate={orgUnit.created} />}</div>
    </div>
  );
};

export default GenerateTablesNeeded;
