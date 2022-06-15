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
        <div>
          {selectedOrgUnits &&
            selectedOrgUnits.map((ou) => (
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
                <div style={{ marginLeft: "20px" }}>
                  <h3>Contrats</h3>
                  {ou.activeContracts &&
                    ou.activeContracts.map((c) => (
                      <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
                        <ContractSummary orgUnit={ou} contract={c} t={t} />
                      </div>
                    ))}
                  {(ou.activeContracts == undefined || ou.activeContracts.length == 0) && (
                    <div style={{ marginLeft: "20px" }}>Pas de contrats pour cette période </div>
                  )}
                </div>
              </div>
            ))}

          <div style={{ marginLeft: "20px" }}>
            <h3>Factures</h3>

            <div style={{ marginLeft: "20px", marginTop: "-10px" }}>
              {selectedOrgUnits && selectedOrgUnits[0] && (
                <InvoiceLinks {...invoiceLinksProps} t={t} orgUnit={selectedOrgUnits[0]} period={searchPeriod} />
              )}
            </div>
          </div>

          <div style={{ marginLeft: "20px" }}>
            <h3>Saisie de données</h3>

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
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceTreeView;
