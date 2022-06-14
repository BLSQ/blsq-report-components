import React, { useState } from "react";
import { TreeViewWithSearch } from "bluesquare-components";
import { setPeriod, treeProps } from "./orgUnitTreeBackend";

const onOrgUnitSelect = (orgUnit) => {
  alert("Selected " + orgUnit.name);
  return [];
};

const formatInitialSelectedIds = (selection) => [];
const formatInitialSelectedParents = (selection) => new Map();

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
        preselected={selectedOrgUnitsIds}
        preexpanded={selectedOrgUnitParents}
        selectedData={selectedOrgUnits}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default OrgUnitTreePicker;
