import React, { useEffect, useState } from "react";
import DatePeriods from "../../support/DatePeriods";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";
import { Link } from "react-router-dom";
import { Button, Paper, Typography, Chip, Grid, IconButton } from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";
import InfoIcon from "@material-ui/icons/Info";
import { Alert } from "@material-ui/lab";

import FormDataContext from "./FormDataContext";
import InvoiceLinks from "../invoices/InvoiceLinks";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router";
import PeriodPicker from "../shared/PeriodPicker";
import PortalHeader from "../shared/PortalHeader";
import LinkedContract from "./LinkedContract";
import { buildFormData } from "./forms";

const DataEntrySelectionPage = ({ history, match, periodFormat, dhis2 }) => {
  const { t, i18n } = useTranslation();
  const dataEntryRegistry = PluginRegistry.extension("dataentry.dataEntries");
  const [orgUnit, setOrgUnit] = useState(undefined);
  const [dataEntries, setDataEntries] = useState(undefined);
  const [linkedContracts, setLinkedContracts] = useState(undefined);
  const [formData, setFormData] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [generalError, setGeneralError] = useState(undefined);

  const period = match.params.period;
  useEffect(() => {
    const loadData = async () => {
      try {
        const contractService = PluginRegistry.extension("contracts.service");

        const contracts = await contractService.fetchContracts(match.params.orgUnitId);
        const activeContracts = contracts.allContracts.filter(
          (c) => c.orgUnit.id == match.params.orgUnitId && c.matchPeriod(period),
        );
        const activeContract = activeContracts[0];

        if (activeContract == undefined) {
          setError({
            message: match.params.orgUnitId + " has no contract for that period : " + period,
            link: "/contracts/" + match.params.orgUnitId,
          });
          return undefined;
        }

        if (activeContracts.length > 1) {
          setError({
            message: match.params.orgUnitId + " has multiple contracts for that period : " + period,
            link: "/contracts/" + match.params.orgUnitId,
          });
          return undefined;
        }

        activeContract.orgUnit.activeContracts = [activeContract];

        const allRelativeActiveContracts = contracts.allContracts.filter((c) => {
          const belongToOrgunitRelated =
            c.orgUnit.id == match.params.orgUnitId ||
            c.orgUnit.id == activeContract.fieldValues.contract_main_orgunit ||
            c.fieldValues.contract_main_orgunit == match.params.orgUnitId ||
            (activeContract.fieldValues.contract_main_orgunit &&
              c.fieldValues.contract_main_orgunit == activeContract.fieldValues.contract_main_orgunit);

          return belongToOrgunitRelated && c.matchPeriod(period);
        });

        setLinkedContracts(allRelativeActiveContracts);

        setOrgUnit(activeContract.orgUnit);
        const expectedDataEntries = dataEntryRegistry.getExpectedDataEntries(activeContract, period);
        setDataEntries(expectedDataEntries);

        if (match.params.dataEntryCode == undefined && expectedDataEntries.length > 0) {
          const defaultDataEntry = expectedDataEntries[0];
          history.push(
            "/dataEntry/" +
              activeContract.orgUnit.id +
              "/" +
              defaultDataEntry.period +
              "/" +
              defaultDataEntry.dataEntryType.code,
          );
        }

        const api = await dhis2.api();
        if (match.params.dataEntryCode) {
          const newFormData = await buildFormData({
            dhis2: dhis2,
            api: api,
            dataEntryCode: match.params.dataEntryCode,
            activeContract: activeContract,
            dataEntryRegistry: dataEntryRegistry,
            period: period,
            setFormData: setFormData,
          });
          setFormData(newFormData);
        }
      } catch (error) {
        setGeneralError(error);
      }
    };
    loadData();
  }, []);
  let DataEntryForm = React.Fragment;
  let dataEntryType;

  if (
    dataEntryRegistry &&
    match.params.dataEntryCode &&
    dataEntries &&
    dataEntries.some((dataEntry) => dataEntry.dataEntryType.code === match.params.dataEntryCode)
  ) {
    DataEntryForm = dataEntryRegistry.getDataEntryForm(match.params.dataEntryCode);
    dataEntryType = dataEntryRegistry.getDataEntry(match.params.dataEntryCode);
  }

  let quarterPeriod = "";
  if (period) {
    quarterPeriod = DatePeriods.split(period, "quarterly")[0];
  }

  return (
    <Paper style={{ minHeight: "90vh", paddingLeft: "50px", paddingTop: "20px" }}>
      {generalError && (
        <div style={{ color: "red" }} title={generalError.stack}>
          {generalError.message}
        </div>
      )}
      {error && (
        <div>
          <Link to={error.link}>{error.message}</Link>
        </div>
      )}
      <h1>
        <AssignmentIcon /> {orgUnit && orgUnit.name}
      </h1>

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

      {orgUnit && orgUnit.activeContracts && (
        <React.Fragment>
          <div>
            {t("dataEntry.contractFrom")} <code>{orgUnit.activeContracts[0].startPeriod}</code>{" "}
            {t("dataEntry.contractTo")} <code>{orgUnit.activeContracts[0].endPeriod}</code>{" "}
            <Link to={"/contracts/" + orgUnit.id}>
              <IconButton>
                <InfoIcon color="action" />
              </IconButton>
            </Link>{" "}
            {orgUnit.activeContracts[0].codes.map((c, index) => (
              <Chip key={c + "_" + index} label={c} style={{ margin: "5px" }} />
            ))}
          </div>
          {linkedContracts && linkedContracts.length > 1 && (
            <div>
              <LinkedContract period={quarterPeriod} orgUnit={orgUnit} linkedContracts={linkedContracts} />
            </div>
          )}
        </React.Fragment>
      )}

      <PortalHeader>
        <div style={{ display: "flex", flexDirection: "row", alignContent: "center", justifyContent: "flex-start" }}>
          <Typography variant="h6" style={{ marginRight: "20px" }}>
            {t("dataEntry.dataEntries")}
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
                history.push("/dataEntry/" + match.params.orgUnitId + "/" + newPeriod);
              }}
            />
          </div>
        </div>
      </PortalHeader>

      <Grid container>
        <Grid item xs={3}>
          <h2>{t("dataEntry.dataEntries")}</h2>
          <table>
            <tbody>
              {dataEntries &&
                dataEntries.map((dataEntry) => {
                  const isCurrent =
                    dataEntry.dataEntryType.code == match.params.dataEntryCode &&
                    dataEntry.period == match.params.period;
                  return (
                    <tr>
                      <td>
                        {" "}
                        <Typography variant="overline" gutterBottom>
                          {dataEntry.dataEntryType.name}
                        </Typography>
                      </td>
                      <td>
                        <Button
                          key={dataEntry.dataEntryType.code + "-" + dataEntry.period + "-" + orgUnit.id}
                          variant="text"
                          color="primary"
                          size="small"
                          component={Link}
                          style={isCurrent ? { backgroundColor: "lightyellow" } : {}}
                          to={"/dataEntry/" + orgUnit.id + "/" + dataEntry.period + "/" + dataEntry.dataEntryType.code}
                          title={dataEntry.period}
                        >
                          {DatePeriods.displayName(
                            dataEntry.period,
                            periodFormat[DatePeriods.detect(dataEntry.period)],
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Grid>
        <Grid item>
          <h2>{t("dataEntry.invoices")}</h2>
          {orgUnit && (
            <InvoiceLinks
              t={t}
              orgUnit={orgUnit}
              period={period}
              invoices={PluginRegistry.extension("invoices.invoices")}
            />
          )}
        </Grid>
      </Grid>
      <div>
        {formData && (
          <FormDataContext.Provider value={formData}>
            {formData.dataSet.id && !formData.isDataWritable() && (
              <Alert severity="info" style={{ maxWidth: "1024px" }}>
                {t("dataEntry.dataSetNotWritable", { interpolation: true, dataSetName: formData.dataSet.name })}
              </Alert>
            )}
            <DataEntryForm
              period={period}
              dataEntryCode={match.params.dataEntryCode}
              formData={formData}
              dataEntryType={dataEntryType}
            />
            <br />
          </FormDataContext.Provider>
        )}
      </div>
    </Paper>
  );
};

export default withRouter(DataEntrySelectionPage);
