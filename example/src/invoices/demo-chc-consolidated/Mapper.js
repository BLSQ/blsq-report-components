class Mapper {
  mapValues(request, values) {
    let totals = [];
    request.orgUnits.forEach(orgUnit => {
      let total = values.amountByOrgUnit(
        "HLPuaFB7Frw",
        orgUnit.id,
        request.quarterPeriod
      );
      totals.push({ orgUnit: orgUnit, total: total });
    });
    const invoice = {
      orgUnit: request.mainOrgUnit,
      orgUnits: request.orgUnits,
      year: request.year,
      quarter: request.quarter,
      activities: [],
      values: values.values,
      totals: totals
    };
    return invoice;
  }
}

export default Mapper;
