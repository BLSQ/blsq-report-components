import React, { useState } from "react";
import OrgUnitTreePicker from "../shared/orgunit_picker/OrgUnitTreePicker";
import InvoiceLinks from "./InvoiceLinks";
import PeriodPicker from "../shared/PeriodPicker";
import { FormControl } from "@material-ui/core";
import { anchorQueryParams, urlWith } from "../shared/tables/urlParams";
import ContractSummary from "../shared/contracts/ContractSummary";
import { Link } from "react-router-dom";
import PluginRegistry from "../core/PluginRegistry";
import DataEntryLinks from "../shared/data_entries/DataEntryLinks";
import { useTranslation } from "react-i18next";

const OrgunitRelatedSection = ({ messageKey, children }) => {
  const { t } = useTranslation();
  return (
    <div style={{ marginLeft: "20px" }}>
      <h3>{t(messageKey)}</h3>
      {children}
    </div>
  );
};

const LocationBreadCrumb = ({ orgUnit, period }) => {
  return (
    <div style={{ fontFamily: "monospace", marginLeft: "20px" }}>
      {orgUnit &&
        orgUnit.ancestors.slice(1, orgUnit.ancestors.length - 1).map((ancestor, index) => {
          return (
            <span key={"ancestor" + index}>
              <Link to={"/select/?q=&period=" + period + "&ou=" + ancestor.id + "&mode=tree"}>{ancestor.name}</Link>
              {index < orgUnit.ancestors.length - 3 && "  >  "}
            </span>
          );
        })}
    </div>
  );
};

const DataEntriesSection = ({ orgUnit, period, periodFormat }) => {
  const dataEntryRegistry = PluginRegistry.extension("dataentry.dataEntries");
  let dataEntries = [];
  if (orgUnit.activeContracts && orgUnit.activeContracts[0]) {
    const expectedDataEntries = dataEntryRegistry.getExpectedDataEntries(orgUnit.activeContracts[0], period);
    dataEntries = expectedDataEntries;
  }
  return (
    <OrgunitRelatedSection messageKey={"Saisie de données"}>
      <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
        {dataEntries && (
          <DataEntryLinks
            dataEntries={dataEntries}
            dataEntryCode={undefined}
            period={period}
            orgUnit={orgUnit}
            periodFormat={periodFormat}
          />
        )}
      </div>
    </OrgunitRelatedSection>
  );
};

const InvoiceLinksSection = ({ invoiceLinksProps, orgUnit, period }) => {
  const { t } = useTranslation();
  return (
    <OrgunitRelatedSection messageKey={"Factures"}>
      <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
        <InvoiceLinks {...invoiceLinksProps} t={t} orgUnit={orgUnit} period={period} />
      </div>
    </OrgunitRelatedSection>
  );
};

const ContractsSection = ({ orgUnit }) => {
  const { t } = useTranslation();

  return (
    <OrgunitRelatedSection messageKey={"Contrats"}>
      {orgUnit.activeContracts &&
        orgUnit.activeContracts.map((c) => (
          <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
            <ContractSummary orgUnit={orgUnit} contract={c} t={t} />
          </div>
        ))}
      {(orgUnit.activeContracts === undefined || orgUnit.activeContracts.length === 0) && (
        <div style={{ marginLeft: "20px" }}>Pas de contrats pour cette période </div>
      )}
    </OrgunitRelatedSection>
  );
};

const InvoiceTreeView = ({ invoiceLinksProps, searchPeriod, classes, onPeriodChange, periodFormat }) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);

  const onOrgUnitChange = (orgunits) => {
    if (orgunits.length) {
      const queryParams = anchorQueryParams();
      queryParams.set("ou", orgunits[0].id);
      const newUrl = urlWith(queryParams);
      window.history.replaceState({}, "", newUrl);
      setSelectedOrgUnits(orgunits);
    }
  };

  return (
    <>
      <FormControl className={classes.periodContainer}>
        <PeriodPicker period={searchPeriod} onPeriodChange={onPeriodChange} periodFormat={periodFormat} />
      </FormControl>
      <br />
      <br />
      <div style={{ display: "flex" }}>
        <div style={{ margin: "10px", width: "500px" }}>
          <OrgUnitTreePicker onChange={onOrgUnitChange} period={searchPeriod} />
        </div>
        {selectedOrgUnits && selectedOrgUnits.length > 0 && (
          <div>
            <h2>{selectedOrgUnits[0].name}</h2>
            <LocationBreadCrumb orgUnit={selectedOrgUnits[0]} period={searchPeriod} />
            <ContractsSection orgUnit={selectedOrgUnits[0]} />
            <InvoiceLinksSection
              orgUnit={selectedOrgUnits[0]}
              period={searchPeriod}
              invoiceLinksProps={invoiceLinksProps}
            />
            <DataEntriesSection orgUnit={selectedOrgUnits[0]} period={searchPeriod} periodFormat={periodFormat} />
          </div>
        )}
      </div>
    </>
  );
};

export default InvoiceTreeView;
