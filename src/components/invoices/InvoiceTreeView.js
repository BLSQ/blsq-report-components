import React, { useState } from "react";
import OrgUnitTreePicker from "../shared/orgunit_picker/OrgUnitTreePicker";
import InvoiceLinks from "./InvoiceLinks";
import PeriodPicker from "../shared/PeriodPicker";
import { FormControl } from "@material-ui/core";
import { anchorQueryParams, urlWith } from "../shared/tables/urlParams";
import ContractSummary from "../shared/contracts/ContractSummary";
import { Link } from "react-router-dom";

const InvoiceTreeView = ({ invoiceLinksProps, searchPeriod, t, classes, onPeriodChange, periodFormat }) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const onOrgUnitChange = (orgunits) => {
    const queryParams = anchorQueryParams();
    queryParams.set("ou", orgunits[0].id);
    const newUrl = urlWith(queryParams);
    if (newUrl !== window.location.toString()) {
      window.history.replaceState({}, "", urlWith(queryParams));
    }
    setSelectedOrgUnits(orgunits);
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
                    <div style={{ marginLeft: "20px"}}>Pas de contrats pour cette période </div>
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
        </div>
      </div>
    </>
  );
};

export default InvoiceTreeView;
