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

const InvoiceTreeView = ({ invoiceLinksProps, searchPeriod, t, classes, onPeriodChange, periodFormat }) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const [dataEntries, setDataEntries] = useState([]);
  const dataEntryRegistry = PluginRegistry.extension("dataentry.dataEntries");

  const onOrgUnitChange = (orgunits) => {
    if (orgunits.length) {
      const queryParams = anchorQueryParams();
      queryParams.set("ou", orgunits[0].id);
      const newUrl = urlWith(queryParams);
      window.history.replaceState({}, "", newUrl);
      const activeContracts = orgunits[0].activeContracts;
      if (activeContracts.length) {
        const expectedDataEntries = dataEntryRegistry.getExpectedDataEntries(activeContracts[0], searchPeriod);
        setDataEntries(expectedDataEntries);
      } else {
        setDataEntries([]);
      }
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
            {selectedOrgUnits.map((ou) => (
              <div>
                <h2>{ou.name}</h2>
                <div style={{ fontFamily: "monospace", marginLeft: "20px" }}>
                  {ou &&
                    ou.ancestors.slice(1, ou.ancestors.length - 1).map((ancestor, index) => {
                      return (
                        <span key={"ancestor" + index}>
                          <Link to={"/select/?q=&period=" + searchPeriod + "&parent=" + ancestor.id}>
                            {ancestor.name}
                          </Link>
                          {index < ou.ancestors.length - 3 && "  >  "}
                        </span>
                      );
                    })}
                </div>

                <OrgunitRelatedSection messageKey={"Contrats"}>
                  {ou.activeContracts &&
                    ou.activeContracts.map((c) => (
                      <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
                        <ContractSummary orgUnit={ou} contract={c} t={t} />
                      </div>
                    ))}
                  {(ou.activeContracts == undefined || ou.activeContracts.length == 0) && (
                    <div style={{ marginLeft: "20px" }}>Pas de contrats pour cette période </div>
                  )}
                </OrgunitRelatedSection>
              </div>
            ))}

            <OrgunitRelatedSection messageKey={"Factures"}>
              <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
                <InvoiceLinks {...invoiceLinksProps} t={t} orgUnit={selectedOrgUnits[0]} period={searchPeriod} />
              </div>
            </OrgunitRelatedSection>

            <OrgunitRelatedSection messageKey={"Saisie de données"}>
              <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
                {dataEntries && (
                  <DataEntryLinks
                    dataEntries={dataEntries}
                    dataEntryCode={undefined}
                    period={searchPeriod}
                    orgUnit={selectedOrgUnits[0] || []}
                    periodFormat={periodFormat}
                  />
                )}
              </div>
            </OrgunitRelatedSection>
          </div>
        )}
      </div>
    </>
  );
};

export default InvoiceTreeView;
