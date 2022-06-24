import React, { useState, useEffect } from "react";
import { TreeViewWithSearch } from "bluesquare-components";
import { setPeriod, treeProps, setUser, formatInitialSelectedParents } from "./orgUnitTreeBackend";
import ContractSummary from "../contracts/ContractSummary";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";



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

const OrgUnitTreePicker = ({ initialSelection, onChange, period, user }) => {
  setPeriod(period);
  const currentUser = useSelector((state) => state.currentUser.profile);
  setUser(currentUser);

  const [selectedOrgUnits, setSelectedOrgUnits] = useState(initialSelection);
  const onUpdate = (orgUnitIds, parentsData, orgUnits) => {
    console.log("onUpdate", orgUnitIds, parentsData, orgUnits);
    if (orgUnits) {
      setSelectedOrgUnits(orgUnits);
    }
    if (onChange) {
      onChange(orgUnits);
    }
  };
  const fetchSelectionQuery = useQuery("fetchSelectionQuery", async () => {
    if (initialSelection) {
      const rootData = await treeProps.getOrgUnitById(initialSelection, currentUser);
      if (rootData[0] && rootData[0].ancestors.length) {
        const loadedAncestors = [];
        for (let ancestor of rootData[0].ancestors) {
          let loadedAncestor = await treeProps.getOrgUnitById(ancestor.id, currentUser);
          loadedAncestors.push(loadedAncestor[0]);
        }
        rootData[0].ancestors = loadedAncestors;
      }
      let parents = new Map();
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
