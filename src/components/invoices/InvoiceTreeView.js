import React, { useState } from "react";
import OrgUnitTreePicker from "../shared/orgunit_picker/OrgUnitTreePicker";
import InvoiceLinks from "./InvoiceLinks";

const InvoiceTreeView = ({ invoiceLinksProps, searchPeriod, t }) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const onOrgUnitChange = (orgunits) => {
    setSelectedOrgUnits(orgunits);
  };
  return (
    <div style={{ display: "flex" }}>
      <div style={{ margin: "10px", width: "500px" }}>
        <OrgUnitTreePicker onChange={onOrgUnitChange} />
      </div>
      <div>
        {selectedOrgUnits &&
          selectedOrgUnits.map((ou) => (
            <div>
              <h2>{ou.name}</h2>
              <h3>Contrats</h3>
              {ou.activeContracts &&
                ou.activeContracts
                  .filter((c) => c.matchPeriod(searchPeriod))
                  .map((c) => (
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
  );
};

export default InvoiceTreeView;
