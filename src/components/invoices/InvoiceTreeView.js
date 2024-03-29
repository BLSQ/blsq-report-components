import React, { useState } from "react";
import OrgUnitTreePicker from "../shared/orgunit_picker/OrgUnitTreePicker";
import PeriodPicker from "../shared/PeriodPicker";
import { FormControl } from "@material-ui/core";
import { anchorQueryParams, urlWith } from "../shared/tables/urlParams";
import ContractsSection from "../contracts/ContractsSection";
import DataEntriesSection from "../dataentry/DataEntriesSection";
import InvoiceLinksSection from "./InvoiceLinksSection";
import AncestorsBreadcrumbs from "../shared/AncestorsBreadcrumb";
import CoordinatesSection from "../pyramid/CoordinatesSection";

const LocationBreadCrumb = ({ orgUnit, period }) => {
  return (
    <div style={{ fontFamily: "monospace", marginLeft: "20px" }}>
      <AncestorsBreadcrumbs
        orgUnit={orgUnit}
        link={(ancestor) => `/select/?q=&period=${period}&ou=${ancestor.id}&mode=tree`}
      />
    </div>
  );
};

const OrgUnitDetails = ({ orgUnit, searchPeriod, invoiceLinksProps }) => {
  return (
    <div>
      <h2>{orgUnit.name}</h2>
      <LocationBreadCrumb orgUnit={orgUnit} period={searchPeriod} />
      <div style={{ marginLeft: "20px",  }}>
          <ContractsSection orgUnit={orgUnit} />
          <InvoiceLinksSection orgUnit={orgUnit} period={searchPeriod} invoiceLinksProps={invoiceLinksProps} />
          <DataEntriesSection orgUnit={orgUnit} period={searchPeriod} />
          <CoordinatesSection orgUnit={orgUnit} />
      </div>
    </div>
  );
};

const InvoiceTreeView = ({ invoiceLinksProps, searchPeriod, classes, onPeriodChange, periodFormat, currentUser }) => {
  const queryParams = anchorQueryParams();
  const ou = queryParams.get("ou");

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
    <div style={{margin: 0}}>
      <FormControl className={classes.periodContainer}>
        <PeriodPicker period={searchPeriod} onPeriodChange={onPeriodChange} periodFormat={periodFormat} />
      </FormControl>
      <br />
      <br />
      <div style={{ display: "flex" }}>
        <div style={{ margin: "10px", width: "500px" }}>
          <OrgUnitTreePicker
            onChange={onOrgUnitChange}
            initialSelection={ou}
            period={searchPeriod}
            user={currentUser}
          />
        </div>
        {selectedOrgUnits && selectedOrgUnits[0] && (
          <OrgUnitDetails
            orgUnit={selectedOrgUnits[0]}
            searchPeriod={searchPeriod}
            invoiceLinksProps={invoiceLinksProps}
          />
        )}
      </div>
    </div>
  );
};

export default InvoiceTreeView;
