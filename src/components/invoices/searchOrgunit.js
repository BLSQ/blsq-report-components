import PluginRegistry from "../core/PluginRegistry";

function hasAccess(contract, user) {
  return user.organisationUnits.some((ou) => contract.orgUnit.path.includes(ou.id));
}

function normalizeName(name) {
  if (name == undefined) {
    return undefined;
  }
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function searchCategoryCombo({ searchValue, contractedOrgUnitGroupId, dhis2 }) {
  const categoryCombos = await dhis2.getCategoryComboById();
  let optionsCombos = categoryCombos.categoryOptionCombos.filter(
    (cc) => cc.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1,
  );
  return optionsCombos.map((option) => {
    return {
      id: option.id,
      shortName: option.shortName,
      name: option.name,
      ancestors: [],
      level: 0,
      organisationUnitGroups: [{ name: "", id: contractedOrgUnitGroupId }],
    };
  });
}

async function searchOrgunit({ searchValue, user, period, parent, contractedOrgUnitGroupId, dhis2 }) {
  const orgUnitsResp = await dhis2.searchOrgunits(
    searchValue,
    user.dataViewOrganisationUnits,
    contractedOrgUnitGroupId,
    parent,
  );
  let categoryList = [];
  if (dhis2.categoryComboId) {
    categoryList = await searchCategoryCombo({ searchValue, contractedOrgUnitGroupId, dhis2 });
    categoryList.forEach((cl) =>
      orgUnitsResp.organisationUnits.push({
        id: cl.id,
        shortName: cl.shortName,
        name: cl.name,
        ancestors: [],
        level: cl.level,
        organisationUnitGroups: cl.organisationUnitGroups,
      }),
    );
  }
  const contractService = PluginRegistry.extension("contracts.service");
  if (contractService) {
    const contracts = await contractService.findAll();
    const contractByOrgUnitId = {};
    contracts.forEach((contract) => {
      if (contractByOrgUnitId[contract.orgUnit.id] == undefined) {
        contractByOrgUnitId[contract.orgUnit.id] = [];
      }
      contractByOrgUnitId[contract.orgUnit.id].push(contract);
    });

    // Try to complement the first page with contracted orgunits matching the same criteria
    const orgunitSet = new Set(orgUnitsResp.organisationUnits.map((o) => o.id));
    const normalizedSearchValue = normalizeName(searchValue);
    const matchingContracts = contracts
      .filter((c) => hasAccess(c, user) && c.matchPeriod(period))
      .filter((o) => {
        const matchName =
          searchValue == "" ||
          searchValue == undefined ||
          normalizeName(o.orgUnit.name).includes(normalizedSearchValue);
        const matchParent = parent ? o.orgUnit.path.includes(parent) : true;
        return matchName && matchParent;
      });

    const complementOrgunits = [];
    for (let contract of matchingContracts) {
      if (complementOrgunits.length <= 50 && !orgunitSet.has(contract.orgUnit.id)) {
        complementOrgunits.push(contract.orgUnit);
      }
    }

    // Reload via the api the orgunits to complement
    const api = await dhis2.api();
    let extraOrgunits = { organisationUnits: [] };
    if (complementOrgunits.length > 0) {
      extraOrgunits = await api.get("organisationUnits", {
        fields: "[*],ancestors[id,name],organisationUnitGroups[id,name,code]",
        filter: "id:in:[" + complementOrgunits.map((o) => o.id).join(",") + "]",
      });
    }
    extraOrgunits.organisationUnits.forEach((ou) => orgUnitsResp.organisationUnits.push(ou));

    orgUnitsResp.organisationUnits.forEach((orgUnit) => {
      orgUnit.fullname = (orgUnit.ancestors || [])
        .map((a) => a.name)
        .concat([orgUnit.name])
        .join(" > ");
      orgUnit.contracts = contractByOrgUnitId[orgUnit.id] || [];
      orgUnit.activeContracts = orgUnit.contracts.filter((c) => c.matchPeriod(period));
    });
    orgUnitsResp.organisationUnits = _.sortBy(orgUnitsResp.organisationUnits, ["path", "fullname"]);
  }
  return orgUnitsResp;
}

export default searchOrgunit;
