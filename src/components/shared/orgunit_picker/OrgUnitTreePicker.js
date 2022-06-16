import React, { useState } from "react";
import { TreeViewWithSearch } from "bluesquare-components";
import { setPeriod, treeProps } from "./orgUnitTreeBackend";
import ContractSummary from "../contracts/ContractSummary";

const onOrgUnitSelect = (orgUnit) => {
  alert("Selected " + orgUnit.name);
  return [];
};

const formatInitialSelectedIds = (selection) => [];
const formatInitialSelectedParents = (selection) => new Map();

const makeDropDownText = (orgUnit) => {
  return (
    <div key={orgUnit.id}>
      <span display="block">
        {orgUnit.name} <code style={{ color: "lightgrey" }}>{orgUnit.id}</code>
      </span>
      <pre style={{ fontSize: "8px" }}>
        {orgUnit.ancestors
          .slice(1)
          .map((o) => o.name)
          .join(" > ")}
      </pre>
      {orgUnit.activeContracts && orgUnit.activeContracts[0] && <ContractSummary orgUnit={orgUnit} contract={orgUnit.activeContracts[0]} />}
      <hr />
    </div>
  );
};

const OrgUnitTreePicker = ({ initialSelection, onChange, period }) => {
  setPeriod(period);

  const [selectedOrgUnits, setSelectedOrgUnits] = useState(initialSelection);

  const [selectedOrgUnitsIds, setSelectedOrgUnitsIds] = useState(formatInitialSelectedIds(initialSelection));
  // Using this value to generate TruncatedTree and tell the Treeview which nodes are already expanded
  const [selectedOrgUnitParents, setSelectedOrgUnitParents] = useState(formatInitialSelectedParents(initialSelection));

  const onUpdate = (orgUnitIds, parentsData, orgUnits) => {
    setSelectedOrgUnitsIds(orgUnitIds);
    setSelectedOrgUnitParents(parentsData);
    if (orgUnits) {
      setSelectedOrgUnits(orgUnits);
    }
    if (onChange) {
      onChange(orgUnits);
    }
  };

  return (
    <div>
      <TreeViewWithSearch
        {...treeProps}
        makeDropDownText={makeDropDownText}
        preselected={selectedOrgUnitsIds}
        preexpanded={selectedOrgUnitParents}
        selectedData={selectedOrgUnits}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default OrgUnitTreePicker;
