import DatePeriods from "../../support/DatePeriods";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";
import MUIDataTable from "mui-datatables";
import React, { useEffect } from "react";
import PortalHeader from "../shared/PortalHeader";
import PeriodPicker from "../shared/PeriodPicker";
import { Typography } from "@material-ui/core";

import { toCompleteness, buildStatsByZone } from "./calculations";
import { orgUnitColumns, zoneStatsColumns, statsTableOptions, tableOptions } from "./tables";
import { useTranslation } from "react-i18next";

const fetchCompleteDataSetRegistrations = async (api, quarterPeriod, DataEntries, accessibleZones) => {
  const periods = [quarterPeriod]
    .concat(DatePeriods.split(quarterPeriod, "monthly"))
    .concat(DatePeriods.split(quarterPeriod, "yearly"));

  const dataSets = DataEntries.getAllDataEntries().flatMap((de) => {
    if (de.dataSetId) {
      return [de.dataSetId];
    } else if (de.dataSetIds) {
      return de.dataSetIds;
    } else {
      return [];
    }
  });

  let completeDataSetRegistrations = [];
  for (let ou of accessibleZones) {
    const ds = await api.get("completeDataSetRegistrations", {
      orgUnit: ou.id,
      children: true,
      period: periods,
      dataSet: dataSets,
    });
    completeDataSetRegistrations = completeDataSetRegistrations.concat(ds.completeDataSetRegistrations);
  }

  completeDataSetRegistrations = completeDataSetRegistrations
    .filter((c) => c)
    .filter((c) => {
      // handle newer dhis2 version that has the completed flag
      if (c.hasOwnProperty("completed")) {
        return c.completed;
      }
      // else keep all records
      return true;
    });

  return completeDataSetRegistrations;
};

const CompletenessView = (props) => {
  const history = props.history;
  const quarterPeriod = props.match.params.period;
  const { t } = useTranslation();
  const [completnessInfos, setCompletnessInfos] = React.useState([]);

  const [statsByZone, setStatsByZone] = React.useState([]);
  const [distinctDataEntries, setDistinctDataEntries] = React.useState([]);
  const [selectedZones, setSelectedZones] = React.useState([]);

  const loadContracts = async () => {
    const DataEntries = PluginRegistry.extension("dataentry.dataEntries");

    const dhis2 = PluginRegistry.extension("core.dhis2");
    const api = await dhis2.api();
    const currentUser = props.currentUser;
    const contractService = PluginRegistry.extension("contracts.service");
    const accessibleOrgunitIds = new Set(currentUser.organisationUnits.map((ou) => ou.id));
    const contracts = (await contractService.findAll()).filter(
      (contract) =>
        contract.matchPeriod(quarterPeriod) &&
        contract.orgUnit.ancestors.some((ancestor) => accessibleOrgunitIds.has(ancestor.id)),
    );
    const completeDataSetRegistrations = await fetchCompleteDataSetRegistrations(
      api,
      quarterPeriod,
      DataEntries,
      currentUser.organisationUnits,
    );
    const { distinctDataEntries, results } = toCompleteness(
      contracts,
      completeDataSetRegistrations,
      DataEntries,
      quarterPeriod,
      window.location.href.split("#")[0],
    );
    setDistinctDataEntries(distinctDataEntries);

    const statsByZone = buildStatsByZone(results, distinctDataEntries);
    setStatsByZone(statsByZone);
    setCompletnessInfos(results);
  };

  useEffect(() => {
    loadContracts();
  }, [quarterPeriod]);

  let filteredCompletnessInfos = completnessInfos;
  const zoneNames = selectedZones.map((stat) => stat.orgUnit.name);

  if (selectedZones.length > 0) {
    const zoneIds = new Set(selectedZones.map((stat) => stat.orgUnit.id));
    filteredCompletnessInfos = completnessInfos.filter((info) =>
      info.contract.orgUnit.ancestors.some((ancestor) => zoneIds.has(ancestor.id)),
    );
  }

  const columns = orgUnitColumns(distinctDataEntries, filteredCompletnessInfos, t);
  const columnsStats = zoneStatsColumns(distinctDataEntries, statsByZone);

  return (
    <div>
      <PortalHeader>
        <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "flex-start" }}>
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            {t("completeness.header")}
          </Typography>
          <div style={{ background: "rgba(255, 255, 255, 0.20)", color: "#fff; important!", padding: "5px" }}>
            <PeriodPicker
              variant="white"
              disableInputLabel={true}
              period={quarterPeriod}
              periodDelta={{
                before: 5,
                after: 5,
              }}
              onPeriodChange={(newPeriod) => {
                setCompletnessInfos([]);
                setStatsByZone([]);
                setDistinctDataEntries([]);
                const newUrl = window.location.href.replace("/completeness/"+quarterPeriod, "/completeness/"+newPeriod)                
                window.history.pushState({}, '', newUrl);
                window.location.reload()
              }}
            ></PeriodPicker>
          </div>
        </div>
      </PortalHeader>
      <MUIDataTable
        title={t("completeness.statsByZone")}
        data={statsByZone}
        columns={columnsStats}
        options={statsTableOptions(quarterPeriod, statsByZone, setSelectedZones)}
      />

      <br></br>

      <MUIDataTable
        title={zoneNames.length == 0 ? t("completeness.statsForOrgUnits"): t("completeness.statsForOrgUnitsUnder")+" " + zoneNames.join(", ")}
        data={filteredCompletnessInfos}
        columns={columns}
        options={tableOptions(quarterPeriod)}
      />
    </div>
  );
};

export default CompletenessView;
