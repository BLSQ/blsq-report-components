import { getInstance } from "d2/lib/d2";
import PluginRegistry from "../../core/PluginRegistry";

let currentPeriod = undefined;

export const setPeriod = (argPeriod) => {
  currentPeriod = argPeriod;
};

const loadedOrgUnitsById = {};
let contractsByOrgUnitId = {};
const defaultOrgUnitFields =
  "id,name,ancestors[id,name],children[id,name,ancestors[id,name],children[id,name,ancestors[id,name],children]]";

export const getRootData = async (id, type = "source") => {
  if (Object.keys(contractsByOrgUnitId).length === 0) {
    const contractService = PluginRegistry.extension("contracts.service");
    const allContracts = await contractService.findAll();
    contractsByOrgUnitId = _.groupBy(allContracts, (c) => c.orgUnit.id);
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

export const getChildrenData = async (id) => {
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

export const request = async (value, count, source, version) => {
  const d2 = await getInstance();
  const api = await d2.Api.getApi();
  const resp = await api.get("organisationUnits", {
    filter: "name:ilike:" + value,
    fields: defaultOrgUnitFields,
  });

  return withHasChildren(resp.organisationUnits);
};

export const label = (data) => {
  return data.name;
};

export const search = (input1, input2, type) => {
  console.log(input1, input2, type);
  return [];
};

export const makeDropDownText = (orgUnit) => {
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
  makeDropDownText,
  parseNodeIds: parseNodeIds,
  toggleOnLabelClick: false,
  isSelectable: () => true,
};
