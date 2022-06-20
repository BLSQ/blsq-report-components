import React, { useState } from "react";
import { TreeViewWithSearch } from "bluesquare-components";
import { setPeriod, treeProps } from "./orgUnitTreeBackend";
import ContractSummary from "../contracts/ContractSummary";
import { useQuery, useMutation, useQueryClient } from "react-query";

const formatInitialSelectedIds = (selection) => {
  if (!selection) return [];
  if (!Array.isArray(selection)) return [selection.id];
  return selection.map((ou) => ou.id);
};

const formatInitialSelectedParents = (selection) => {
  const selectedParents = new Map();
  const parentsMap = new Map();
  selectedParents.set(selection.id, parentsMap);
  for (const ancestor of selection.ancestors) {
    parentsMap.set(ancestor.id, ancestor);
  }
  return selectedParents;
};

const makeDropDownText = (orgUnit) => {
  return (
    <div key={orgUnit.id}>
      <span display="block">
        <b>{orgUnit.name}</b> <code style={{ color: "lightgrey" }}>{orgUnit.id}</code>
      </span>
      <pre style={{ fontSize: "8px" }}>
        {orgUnit.ancestors
          .slice(1)
          .map((o) => o.name)
          .join(" > ")}
      </pre>
      {orgUnit.activeContracts && orgUnit.activeContracts[0] && (
        <ContractSummary orgUnit={orgUnit} contract={orgUnit.activeContracts[0]} />
      )}
      <hr />
    </div>
  );
};

const OrgUnitTreePicker = ({ initialSelection, onChange, period }) => {
  setPeriod(period);

  const [selectedOrgUnits, setSelectedOrgUnits] = useState(initialSelection);

  const [selectedOrgUnitsIds, setSelectedOrgUnitsIds] = useState(formatInitialSelectedIds(initialSelection));
  // Using this value to generate TruncatedTree and tell the Treeview which nodes are already expanded
  // const formattedSelection = formatInitialSelectedParents(initialSelection);
  const [selectedOrgUnitParents, setSelectedOrgUnitParents] = useState(null);

  const fetchSelectionQuery = useQuery("fetchSelectionQuery", async () => {
    if (initialSelection) {
      const rootData = await treeProps.getOrgUnitById(initialSelection);
      let parents;
      if (rootData[0] && rootData[0].ancestors.length) {
        parents = formatInitialSelectedParents(rootData[0]);
        setSelectedOrgUnitParents(parents);
      }
      return {
        preselected: initialSelection,
        preexpanded: rootData,
      };
    }
  });

  const preselected = fetchSelectionQuery?.data?.preselected;
  const preexpanded = fetchSelectionQuery?.data?.preexpanded;

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
        preselected={preselected}
        preexpanded={preexpanded}
        selectedData={selectedOrgUnits}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default OrgUnitTreePicker;
