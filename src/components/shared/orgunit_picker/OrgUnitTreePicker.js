import React, { useState, useEffect } from "react";
import { TreeViewWithSearch } from "bluesquare-components";
import { setPeriod, treeProps } from "./orgUnitTreeBackend";
import ContractSummary from "../contracts/ContractSummary";
import { useQuery, useMutation, useQueryClient } from "react-query";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  // if not there, a parent is missing
  parentsMap.set(selection.id, selection);
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
  const onUpdate = (orgUnitIds, parentsData, orgUnits) => {
    console.log("onUpdate", orgUnitIds, parentsData, orgUnits)
    if (orgUnits) {
      setSelectedOrgUnits(orgUnits);
    }
    if (onChange) {
      onChange(orgUnits);
    }
  };
  const fetchSelectionQuery = useQuery("fetchSelectionQuery", async () => {
    if (initialSelection) {
      const rootData = await treeProps.getOrgUnitById(initialSelection);
      if (rootData[0] && rootData[0].ancestors.length) {
        const loadedAncestors = [];
        for (let ancestor of rootData[0].ancestors) {
          let loadedAncestor = await treeProps.getOrgUnitById(ancestor.id);
          loadedAncestors.push(loadedAncestor[0]);
        }
        rootData[0].ancestors = loadedAncestors;
      }
      let parents;
      if (rootData[0] && rootData[0].ancestors.length) {
        parents = formatInitialSelectedParents(rootData[0]);
      }
      return {
        rootData: rootData,
        preselected: initialSelection,
        preexpanded: parents,
      };
    }
  });

  const preselected = fetchSelectionQuery?.data?.preselected;
  const preexpanded = fetchSelectionQuery?.data?.preexpanded;

  useEffect(() => {
    if (preselected) {
      onUpdate(undefined, undefined, fetchSelectionQuery?.data?.rootData);
    }
  }, [preselected]);

  if (preselected || preexpanded) {
    console.log("preselected", preselected, " preexpanded", preexpanded);
  }
  if (initialSelection && preselected == undefined) {
    return <span>Loading...</span>;
  }
  return (
    <div>
      {fetchSelectionQuery.status === "loading" ? (
        <span>Loading...</span>
      ) : fetchSelectionQuery.status === "error" ? (
        <span>Error: {error.message}</span>
      ) : (
        <TreeViewWithSearch
          {...treeProps}
          makeDropDownText={makeDropDownText}
          preselected={preselected}
          preexpanded={preexpanded}
          selectedData={selectedOrgUnits}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default OrgUnitTreePicker;
