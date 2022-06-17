import { getInstance } from "d2/lib/d2";
import PluginRegistry from "../../core/PluginRegistry";

let currentPeriod = undefined;

export const setPeriod = (argPeriod) => {
  currentPeriod = argPeriod;
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
      debugger;
      if (contract.orgUnit && contract.orgUnit.ancestors) {
        for (let ancestor of contract.orgUnit.ancestors) {
          contractsByLevelUid[ancestor.id] ||= 0;
          contractsByLevelUid[ancestor.id] += 1;
        }
      }
    }
  
  }

  const d2 = await getInstance();
  const api = await d2.Api.getApi();
  const resp = await api.get("organisationUnits", {
    filter: "level:eq:1",
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

const request = async (value, count, source, version) => {
  const d2 = await getInstance();
  const api = await d2.Api.getApi();
  const resp = await api.get("organisationUnits", {
    filter: "name:ilike:" + value,
    fields: defaultOrgUnitFields,
  });

  return withHasChildren(resp.organisationUnits);
};

const label = (data) => {
  return data.name + (contractsByLevelUid[data.id] ? " (" + contractsByLevelUid[data.id] + ")": "");
};

const search = (input1, input2, type) => {
  console.log(input1, input2, type);
  return [];
};

const parseNodeIds = (orgUnit) => {
  const parsed = orgUnit.ancestors.map((a) => [a.id, a]).concat([[orgUnit.id, orgUnit]]);
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
};
