import PluginRegistry from "../core/PluginRegistry";

async function searchOrgunit({ searchValue, user, period, parent, contractedOrgUnitGroupId, dhis2 }) {
  const orgUnitsResp = await dhis2.searchOrgunits(
    searchValue,
    user.dataViewOrganisationUnits,
    contractedOrgUnitGroupId,
    parent,
  );
  let categoryList = [];
  if (dhis2.categoryComboId) {
    categoryList = await this.searchCategoryCombo(searchvalue);
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
    orgUnitsResp.organisationUnits.forEach((orgUnit) => {
      orgUnit.contracts = contractByOrgUnitId[orgUnit.id] || [];
      orgUnit.activeContracts = orgUnit.contracts.filter((c) => c.matchPeriod(period));
    });
  }
  return orgUnitsResp.organisationUnits;
};

export default searchOrgunit;
