import PluginRegistry from "../core/PluginRegistry";
import MUIDataTable from "mui-datatables";
import React, { useEffect } from "react";
import PeriodPicker from "../shared/PeriodPicker";
import { Typography } from "@material-ui/core";
import { QueryErrorResetBoundary, useQuery } from "react-query";
import { toCompleteness, buildStatsByZone } from "./calculations";
import { orgUnitColumns, zoneStatsColumns, statsTableOptions, tableOptions } from "./tables";
import { useTranslation } from "react-i18next";
import { anchorQueryParams, urlWith } from "../shared/tables/urlParams";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { fetchCompleteDataSetRegistrations } from "./fetchCompleteDataSetRegistrations";


const styles = (theme) => ({
  root: {
    paddingLeft:theme.spacing(1), 
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
  
});
const useStyles = makeStyles((theme) => styles(theme));

const CompletenessView = (props) => {
  const classes = useStyles();
  const quarterPeriod = props.match.params.period;
  const { t } = useTranslation();
  const [completnessInfos, setCompletnessInfos] = React.useState([]);

  const [statsByZone, setStatsByZone] = React.useState([]);
  const [distinctDataEntries, setDistinctDataEntries] = React.useState([]);
  const [selectedZones, setSelectedZones] = React.useState([]);
  const setSelectedZonesAndQueryParams = (zones) => {
    const queryParams = anchorQueryParams();
    if (zones.length == 0) {
      queryParams.delete("selectedZones");
    } else {
      queryParams.set("selectedZones", zones.filter(r => r.orgUnit).map((r) => r.orgUnit.id).join(";"));
    }
    const newUrl = urlWith(queryParams);

    if (newUrl !== window.location.toString()) {
      window.history.replaceState({}, "", urlWith(queryParams));
    }

    setSelectedZones(zones);
  };

  const DataEntries = PluginRegistry.extension("dataentry.dataEntries");
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const currentUser = props.currentUser;
  const contractService = PluginRegistry.extension("contracts.service");
  const accessibleOrgunitIds = new Set(currentUser.organisationUnits.map((ou) => ou.id));
  const queryParams = anchorQueryParams()
  const pageName = queryParams.get("pageName")
  
  const fetchContractsQuery = useQuery(["fetchContracts", quarterPeriod, pageName], async () => {
    const api = await dhis2.api();
    let contracts = (await contractService.findAll()).filter(
      (contract) =>
        contract.matchPeriod(quarterPeriod) &&
        contract.orgUnit.ancestors.some((ancestor) => accessibleOrgunitIds.has(ancestor.id)),
    );

    if (queryParams.get("ou.contract.codes")) {
      const codes = queryParams.get("ou.contract.codes").split(",")
      contracts = contracts.filter(c => c.codes.some(code => codes.includes(code)))
    }
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

    const selectedZones = queryParams.get("selectedZones");
    if (statsByZone && selectedZones) {
      const selectOrgUnits = []
      for (let row of statsByZone) {
        if (row && row.orgUnit && selectedZones.includes(row.orgUnit.id)) {
          selectOrgUnits.push(row)
        }
      }
      setSelectedZones(selectOrgUnits)
    }
  })

  let filteredCompletnessInfos = completnessInfos;
  const zoneNames = selectedZones.filter(r => r.orgUnit).map((stat) => stat.orgUnit.name);

  if (selectedZones.length > 0) {
    const zoneIds = new Set(selectedZones.filter(r=> r.orgUnit).map((stat) => stat.orgUnit.id));
    filteredCompletnessInfos = completnessInfos.filter((info) =>
      info.contract.orgUnit.ancestors.some((ancestor) => zoneIds.has(ancestor.id)),
    );
  }

  const columns = orgUnitColumns(distinctDataEntries, filteredCompletnessInfos, t);
  const columnsStats = zoneStatsColumns(distinctDataEntries, statsByZone, t);

  return (
    <div>
      <Paper className={classes.root} elevation={3}>
        <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "flex-start", margin: "12px" }}>
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            {t("completeness.header")}
          </Typography>
          <div style={{ background: "rgba(255, 255, 255, 0.20)", color: "#fff; important!", padding: "5px" }}>
            <PeriodPicker
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
                const newUrl = window.location.href.replace(
                  "/completeness/" + quarterPeriod,
                  "/completeness/" + newPeriod,
                );
                window.history.pushState({}, "", newUrl);
                window.location.reload();
              }}
             />
          </div>
        </div>
      
      </Paper>
      <br></br>
      <MUIDataTable
        title={t("completeness.statsByZone")}
        data={statsByZone}
        columns={columnsStats}
        options={statsTableOptions(quarterPeriod, statsByZone, setSelectedZonesAndQueryParams)}
      />  
      <br></br>

      <MUIDataTable
        title={
          zoneNames.length == 0
            ? t("completeness.statsForOrgUnits")
            : t("completeness.statsForOrgUnitsUnder") + " " + zoneNames.join(", ")
        }
        data={filteredCompletnessInfos}
        columns={columns}
        options={tableOptions(quarterPeriod)}
      />
    </div>
  );
};

export default CompletenessView;
