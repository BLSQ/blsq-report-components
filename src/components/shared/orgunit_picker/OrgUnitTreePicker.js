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
  return new Map();
  /*const selectedParents = new Map();
  const parentsMap = new Map();
  selectedParents.set(selection.id, parentsMap);
  for (const ancestor of selection.ancestors) {
    parentsMap.set(ancestor.id, ancestor);
  }
  return selectedParents;*/
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
  const formattedSelection = formatInitialSelectedParents(initialSelection);
  const [selectedOrgUnitParents, setSelectedOrgUnitParents] = useState(formattedSelection);

  const fetchSelectionQuery = useQuery(["fetchSelectionQuery",initialSelection], async () => {
    const rootData = await treeProps.getOrgUnitById(initialSelection)
    debugger;
    return {
      preselected: initialSelection,
      preexpanded: rootData,
    }
  });
  

  const onUpdate = (orgUnitIds, parentsData, orgUnits) => {
    console.log(formattedSelection);
    debugger;
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
        preselected={selectedOrgUnitsIds[0]}
        preexpanded={selectedOrgUnitParents}
        selectedData={selectedOrgUnits}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default OrgUnitTreePicker;
