import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Paper } from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";
import DatePeriods from "../../support/DatePeriods";
import PeriodPicker from "../shared/PeriodPicker";
import { Link } from "react-router-dom";

const OrgUnitInvoiceSelectionPage = ({ history, match, periodFormat, dhis2, currentUser, invoices }) => {
  const { t, i18n } = useTranslation();

  const period = match.params.period;

  const fetchOrgUnitQuery = useQuery("fetchOrgUnit", async () => {
    const api = await dhis2.api();
    const response = await api.get("organisationUnits/" + match.params.orgUnitId, {
      fields: "[*],ancestors[id,name],organisationUnitGroups[id,name,code]",
    });
    return response;
  });

  const orgUnit = fetchOrgUnitQuery?.data;

  let quarterPeriod = "";
  if (period) {
    quarterPeriod = DatePeriods.split(period, "quarterly")[0];
  }

  return (
    <Paper style={{ minHeight: "90vh", paddingLeft: "14px", paddingTop: "1px" }}>
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        {orgUnit && (
          <>
            <AssignmentIcon style={{ marginRight: "5px" }} />
            <h1>Invoice selection for : {orgUnit && orgUnit.name}</h1>
            <div style={{ marginLeft: "50px", maxWidth: "300px" }}>
              <PeriodPicker
                disableInputLabel={true}
                period={quarterPeriod}
                periodDelta={{
                  before: 5,
                  after: 5,
                }}
                onPeriodChange={(newPeriod) => {
                  history.push("/reports/" + match.params.orgUnitId + "/" + newPeriod);
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
    </Paper>
  );
};

export default OrgUnitInvoiceSelectionPage;
