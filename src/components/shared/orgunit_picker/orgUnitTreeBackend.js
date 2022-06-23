import React from "react";
import { getInstance } from "d2/lib/d2";
import PluginRegistry from "../../core/PluginRegistry";

let currentPeriod;
export const setPeriod = (argPeriod) => {
  currentPeriod = argPeriod;
};

let user;
export const setUser = (argUser) => {
  console.log(argUser);
  user = argUser;
};

const loadedOrgUnitsById = {};
let contractsByOrgUnitId = {};
let contractsByLevelUid = {};
const defaultOrgUnitFields =
  "id,name,ancestors[id,name],children[id,name,ancestors[id,name],children[id,name,ancestors[id,name],children]]";

const getRootData = async (id, type = "source") => {
  if (Object.keys(contractsByOrgUnitId).length === 0) {
    const contractService = PluginRegistry.extension("contracts.service");
    const allContracts = await contractService.findAll();
    contractsByOrgUnitId = _.groupBy(allContracts, (c) => c.orgUnit.id);

    for (let contract of allContracts.filter((c) => c.matchPeriod(currentPeriod))) {
      if (contract.orgUnit && contract.orgUnit.ancestors) {
        for (let ancestor of contract.orgUnit.ancestors) {
          contractsByLevelUid[ancestor.id] ||= 0;
          contractsByLevelUid[ancestor.id] += 1;
        }
      }
    }
  }

  const resp = await getFilteredOrgUnits("level:eq:3");

  return withHasChildren(resp.organisationUnits);
};

const withHasChildren = (organisationUnits) => {
  for (let ou of organisationUnits) {
    ou.has_children = ou.children && ou.children.length > 0;
    ou.activeContracts = (contractsByOrgUnitId[ou.id] || []).filter((c) => c.matchPeriod(currentPeriod));

    loadedOrgUnitsById[ou.id] = ou;
  }
  organisationUnits.sort((a, b) => a.name.localeCompare(b.name));
  return organisationUnits;
};

const getChildrenData = async (id) => {
  const loadedOrgUnit = loadedOrgUnitsById[id];
  if (loadedOrgUnit && loadedOrgUnit.children && loadedOrgUnit.children[0].children) {
    return withHasChildren(loadedOrgUnit.children);
  }
  const d2 = await getInstance();
  const api = await d2.Api.getApi();
  const resp = await api.get("organisationUnits", {
    filter: "parent.id:eq:" + id,
    fields: defaultOrgUnitFields,
    paging: false,
  });

  return withHasChildren(resp.organisationUnits);
};

const getOrgUnitById = async (id, currentUser) => {
  const d2 = await getInstance();
  const api = await d2.Api.getApi();
  let userOrgUnitsFilter;
  const orgUnits = currentUser.dataViewOrganisationUnits;
  if (orgUnits && orgUnits.length === 1) {
    userOrgUnitsFilter = "&path:like:" + orgUnits[0].id;
  } else if (orgUnits && orgUnits.length > 0) {
    userOrgUnitsFilter = "&filter=ancestors.id:in:[" + orgUnits.map((ou) => ou.id).join(",") + "]";
  }
  const resp = await api.get("organisationUnits", {
    filter: "id:eq:" + id + userOrgUnitsFilter,
    fields: defaultOrgUnitFields,
    paging: false,
  });
  return withHasChildren(resp.organisationUnits);
};

const getFilteredOrgUnits = async (filterStart) => {
  const d2 = await getInstance();
  const api = await d2.Api.getApi();
  
  let userOrgUnitsFilter;
  const orgUnits = user.dataViewOrganisationUnits;
  if (orgUnits && orgUnits.length === 1) {
    userOrgUnitsFilter = ["path:like:" + orgUnits[0].id];
  } else if (orgUnits && orgUnits.length > 0) {
    userOrgUnitsFilter = ["ancestors.id:in:[" + orgUnits.map((ou) => ou.id).join(",") + "]"];
  }
  debugger;
  const resp = await api.get("organisationUnits", {
    filter: userOrgUnitsFilter.concat([filterStart]),
    fields: defaultOrgUnitFields,
    paging: false,
  });
  return resp;
};

const request = async (value, count, source, version) => {
  const resp = await getFilteredOrgUnits("name:ilike:" + value);

  return withHasChildren(resp.organisationUnits);
};

const label = (data) => {
  const activeContractsDecorator = data.activeContracts && data.activeContracts.length > 0;
  const contractsUnder = contractsByLevelUid[data.id] ? " (" + contractsByLevelUid[data.id] + ")" : "";
  if (activeContractsDecorator) {
    return (
      <span>
        <b>{data.name}</b>
        {contractsUnder}
      </span>
    );
  }
  return data.name + contractsUnder;
};

const search = (input1, input2, type) => {
  console.log(input1, input2, type);
  return [];
};

const parseNodeIds = (orgUnit) => {
  const parsed = orgUnit.ancestors
    .slice(2)
    .map((a) => [a.id, a])
    .concat([[orgUnit.id, orgUnit]]);
  return new Map(parsed);
};

export const treeProps = {
  getRootData,
  label,
  getChildrenData,
  search,
  request,
  parseNodeIds: parseNodeIds,
  toggleOnLabelClick: false,
  isSelectable: () => true,
  getOrgUnitById,
};
