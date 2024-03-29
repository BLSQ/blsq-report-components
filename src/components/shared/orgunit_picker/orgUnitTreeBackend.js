import React from "react";
import { getInstance } from "d2/lib/d2";
import PluginRegistry from "../../core/PluginRegistry";

let loadedOrgUnitsById = {};
let contractsByOrgUnitId = {};
let contractsByLevelUid = {};
let currentPeriod;
let user;
let topLevel;

export const setPeriod = (argPeriod) => {
  if (argPeriod !== currentPeriod) {
    loadedOrgUnitsById = {};
    contractsByOrgUnitId = {};
    contractsByLevelUid = {};
  }
  currentPeriod = argPeriod;
};

export const setUser = (argUser) => {
  user = argUser;
  if (user) {
    const levels = user.dataViewOrganisationUnits.map((o) => {
      return o.ancestors ? o.ancestors.length : 0;
    });
    topLevel = Math.min(...levels) + 1;
  }
};

const defaultOrgUnitFields =
  "id,name,ancestors[id,name],children[id,name,ancestors[id,name],children[id,name,ancestors[id,name],children]]";

export const formatInitialSelectedParents = (selection) => {
  const selectedParents = new Map();
  const parentsMap = new Map();
  selectedParents.set(selection.id, parentsMap);
  for (const ancestor of selection.ancestors.slice(topLevel - 1)) {
    parentsMap.set(ancestor.id, ancestor);
  }
  // if not there, a parent is missing
  parentsMap.set(selection.id, selection);
  return selectedParents;
};

const initiliazeContractsCache = async () => {
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
};

const getRootData = async (id, type = "source") => {

  await initiliazeContractsCache()

  const d2 = await getInstance();
  const api = await d2.Api.getApi();

  const resp = await api.get("organisationUnits", {
    filter: "id:in:[" + user.dataViewOrganisationUnits.map((ou) => ou.id).join(",") + "]",
    fields: defaultOrgUnitFields,
    paging: false,
  });

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

const getOrgUnitById = async (id) => {
  await initiliazeContractsCache()

  const d2 = await getInstance();
  const api = await d2.Api.getApi();

  const resp = await api.get("organisationUnits", {
    filter: "id:eq:" + id,
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
    .slice(topLevel - 1)
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
