import React, { useState } from "react";
import { TreeViewWithSearch } from "bluesquare-components";
import { getRootData, getChildrenData, request } from "./orgUnitTreeBackend";

// act as a cache to speed up first levels click

let currentPeriod = undefined;

const setPeriod = (argPeriod) => {
  currentPeriod = argPeriod;
};

export const label = (data) => {
  return data.name;
};

const search = (input1, input2, type) => {
  console.log(input1, input2, type);
  return [];
};

const makeDropDownText = (orgUnit) => {
  return (
    <div>
      <span display="block">
        {orgUnit.name} <code style={{ color: "lightgrey" }}>{orgUnit.id}</code>
      </span>
      <pre style={{ fontSize: "8px" }}>
        {orgUnit.ancestors
          .slice(1)
          .map((o) => o.name)
          .join(" > ")}
      </pre>
      <hr />
    </div>
  );
};

const onOrgUnitSelect = (orgUnit) => {
  alert("Selected " + orgUnit.name);
  return [];
};

const parseNodeIds = (orgUnit) => {
  const parsed = orgUnit.ancestors.map((a) => [a.id, a]).concat([[orgUnit.id, orgUnit]]);
  return new Map(parsed);
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

  const treeProps = {
    getRootData,
    label,
    getChildrenData,
    search,
    request,
    makeDropDownText,
    onSelect: onOrgUnitSelect,
    onUpdate: onUpdate,
    parseNodeIds: parseNodeIds,
    toggleOnLabelClick: false,
    isSelectable: () => true,
  };
  return (
    <div>
      <TreeViewWithSearch
        {...treeProps}
        preselected={selectedOrgUnitsIds}
        preexpanded={selectedOrgUnitParents}
        selectedData={selectedOrgUnits}
      />
    </div>
  );
};

export default OrgUnitTreePicker;
