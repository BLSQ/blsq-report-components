

class GroupBasedOrgUnitsResolver {
  async resolveOrgunits(dhis2, orgUnitId, period, invoiceType, mapper) {
    let mainOrgUnit,
      orgUnits = [],
      categoryCombo = "";

    if (invoiceType.isPartner) {
      categoryCombo = orgUnitId;
      const country = await dhis2.getTopLevels([1]);
      orgUnitId = country.organisationUnits[0].id;
    }

    if (invoiceType.contractGroupSet) {
      orgUnits = await dhis2.getOrgunitsForContract(
        orgUnitId,
        invoiceType.contractGroupSet
      );
      mainOrgUnit = await dhis2.getOrgunit(orgUnitId);
    } else if (invoiceType.organisationUnitGroup) {
      orgUnits = await dhis2.getOrgunitsForGroup(
        orgUnitId,
        invoiceType.organisationUnitGroup
      );
      orgUnits = orgUnits.organisationUnits;
      mainOrgUnit = await dhis2.getOrgunit(orgUnitId);
    } else {
      mainOrgUnit = await dhis2.getOrgunit(orgUnitId);
      orgUnits = [mainOrgUnit];
    }
    return {
      mainOrgUnit,
      orgUnits,
      categoryCombo
    };
  }
}
export default GroupBasedOrgUnitsResolver;
