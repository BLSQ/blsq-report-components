import React, { useState } from "react";
import OrgUnitTreePicker from "../shared/orgunit_picker/OrgUnitTreePicker";
import InvoiceLinks from "./InvoiceLinks";
import PeriodPicker from "../shared/PeriodPicker";
import { FormControl } from "@material-ui/core";

const InvoiceTreeView = ({ invoiceLinksProps, searchPeriod, t, classes, onPeriodChange, periodFormat }) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const onOrgUnitChange = (orgunits) => {
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
                <h3>Contrats</h3>
                {ou.activeContracts &&
                  ou.activeContracts.map((c) => (
                    <div>
                      {c.startPeriod} {c.endPeriod} {c.codes} {c.codes}
                    </div>
                  ))}
              </div>
            ))}
          <h3>Factures</h3>

          {selectedOrgUnits && selectedOrgUnits[0] && (
            <InvoiceLinks {...invoiceLinksProps} t={t} orgUnit={selectedOrgUnits[0]} period={searchPeriod} />
          )}
        </div>
      </div>
    </>
  );
};

export default InvoiceTreeView;
