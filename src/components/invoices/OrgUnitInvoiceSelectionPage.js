import React, { useState } from "react";
import { useQuery } from "react-query";
import AssignmentIcon from "@material-ui/icons/Assignment";
import DatePeriods from "../../support/DatePeriods";
import PeriodPicker from "../shared/PeriodPicker";
import { Link } from "react-router-dom";
import { Paper, Grid } from "@material-ui/core";
import PluginRegistry from "../core/PluginRegistry";
import InvoiceLinksSection from "./InvoiceLinksSection";
import DataEntriesSection from "../dataentry/DataEntriesSection";

const OrgUnitInvoiceSelectionPage = ({ history, match, periodFormat, dhis2, currentUser, invoices }) => {
  const [error, setError] = useState(undefined);

  const period = match.params.period;

  const fetchOrgUnitQuery = useQuery("fetchOrgUnit", async () => {
    const api = await dhis2.api();
    const orgUnit = await api.get("organisationUnits/" + match.params.orgUnitId, {
      fields: "[*],ancestors[id,name],organisationUnitGroups[id,name,code]",
    });

    const contractService = PluginRegistry.extension("contracts.service");
    if (contractService) {
      const contracts = await contractService.findAll();
      const contractByOrgUnitId = {};
      contracts.forEach((contract) => {
        if (contractByOrgUnitId[contract.orgUnit.id] === undefined) {
          contractByOrgUnitId[contract.orgUnit.id] = [];
        }
        contractByOrgUnitId[contract.orgUnit.id].push(contract);
      });
      orgUnit.contracts = contractByOrgUnitId[orgUnit.id] || [];
      orgUnit.activeContracts = orgUnit.contracts.filter((c) => c.matchPeriod(period));
    }

    return orgUnit;
  });

  const orgUnit = fetchOrgUnitQuery?.data;

  let quarterPeriod = "";
  if (period) {
    quarterPeriod = DatePeriods.split(period, "quarterly")[0];
  }

  return (
    <Paper style={{ minHeight: "90vh", paddingLeft: "14px", paddingTop: "1px" }}>
      {error && (
        <div>
          <Link to={error.link}>{error.message}</Link>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        {orgUnit && (
          <>
            <AssignmentIcon style={{ marginRight: "5px" }} />
            <h1>{orgUnit && orgUnit.name}</h1>
            <div style={{ marginLeft: "50px", maxWidth: "300px" }}>
              <PeriodPicker
                disableInputLabel={true}
                period={quarterPeriod}
                periodDelta={{
                  before: 5,
                  after: 5,
                }}
                onPeriodChange={(newPeriod) => {
                  history.push("/reports/" + newPeriod + "/" + match.params.orgUnitId);
                }}
              />
            </div>
          </>
        )}
      </div>

      <div style={{ fontFamily: "monospace" }}>
        {orgUnit &&
          orgUnit.ancestors.slice(1, orgUnit.ancestors.length - 1).map((ancestor, index) => {
            return (
              <span key={"ancestor" + index}>
                <Link to={"/select/?q=&period=" + quarterPeriod + "&parent=" + ancestor.id}>{ancestor.name}</Link>
                {index < orgUnit.ancestors.length - 3 && "  >  "}
              </span>
            );
          })}
      </div>

      <Grid container>
        <Grid item>{orgUnit && <InvoiceLinksSection orgUnit={orgUnit} period={period} />}</Grid>
        <Grid item style={{ marginLeft: "20px" }}>
          <DataEntriesSection period={period} orgUnit={orgUnit} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrgUnitInvoiceSelectionPage;
