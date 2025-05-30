import React, { useEffect, useState } from "react";
import DatePeriods from "../../support/DatePeriods";
import PluginRegistry from "../core/PluginRegistry";
import { Link } from "react-router-dom";
import { Button, Paper, Grid } from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";
import { Alert } from "@material-ui/lab";

import FormDataContext from "./FormDataContext";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router";
import PeriodPicker from "../shared/PeriodPicker";
import LinkedContract from "./LinkedContract";
import { buildFormData } from "./forms";
import ContractsSection from "../contracts/ContractsSection";
import DataEntriesSection from "./DataEntriesSection";
import InvoiceLinksSection from "../invoices/InvoiceLinksSection";
import AncestorsBreadcrumbs from "../shared/AncestorsBreadcrumb";

const checkOverlaps = (contracts) => {
  for (let contract1 of contracts) {
    for (let contract2 of contracts) {
      if (contract1.overlaps(contract2)) {
        return true;
      }
    }
  }
  return false;
};

const ErrorTogglable = ({ generalError }) => {
  const message = generalError.message
    ? generalError.message
    : "Sorry something went wrong : \n" + JSON.stringify(generalError);
  const lines = message.split("\n");
  const [fullDisplay, setFullDisplay] = useState(false);
  return (
    <div>
      <pre style={{ color: "red" }} title={generalError.stack}>
        {fullDisplay ? message : lines[0]}
      </pre>{" "}
      {lines.length > 1 && <Button onClick={() => setFullDisplay(!fullDisplay)}>...</Button>}
    </div>
  );
};
const DataEntrySelectionPage = ({ history, match, periodFormat, dhis2 }) => {
  const { t } = useTranslation();
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

        const hasOverlaps = checkOverlaps(activeContracts);
        if (hasOverlaps) {
          setError({
            message: match.params.orgUnitId + " has overlapping contracts for that period : " + period,
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
    quarterPeriod = DatePeriods.split(period, DatePeriods.getDefaultQuarterFrequency())[0];
  }

  return (
    <Paper style={{ minHeight: "90vh", paddingLeft: "14px", paddingTop: "1px" }}>
      {generalError && <ErrorTogglable generalError={generalError} />}
      {error && (
        <div>
          <Link to={error.link}>{error.message}</Link>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <AssignmentIcon style={{ marginRight: "5px" }} />
        <h1>
          {t("dataEntry.dataEntries")} : {orgUnit && orgUnit.name}
        </h1>
        <div style={{ marginLeft: "50px", maxWidth: "300px" }}>
          <PeriodPicker
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

      <div>
        <AncestorsBreadcrumbs orgUnit={orgUnit} link={(ancestor) => `/select/?q=&period=${quarterPeriod}&parent=${ancestor.id}`} limit={1}/>
      </div>
      <div>
        {orgUnit && (
          <div>
            <ContractsSection orgUnit={orgUnit} />
            {linkedContracts && linkedContracts.length > 1 && (
              <div>
                <LinkedContract period={quarterPeriod} orgUnit={orgUnit} linkedContracts={linkedContracts} />
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <DataEntriesSection dataEntryCode={match.params.dataEntryCode} period={match.params.period} orgUnit={orgUnit} />
        {orgUnit && <InvoiceLinksSection orgUnit={orgUnit} period={period} />}
      </div>

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
