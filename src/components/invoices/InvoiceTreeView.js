import React, { useState } from "react";
import OrgUnitTreePicker from "../shared/orgunit_picker/OrgUnitTreePicker";
import PeriodPicker from "../shared/PeriodPicker";
import { FormControl } from "@material-ui/core";
import { anchorQueryParams, urlWith } from "../shared/tables/urlParams";
import { Link } from "react-router-dom";
import ContractsSection from "../contracts/ContractsSection";
import DataEntriesSection from "../dataentry/DataEntriesSection";
import InvoiceLinksSection from "./InvoiceLinksSection";


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
