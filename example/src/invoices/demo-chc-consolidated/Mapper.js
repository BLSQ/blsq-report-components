class Mapper {
  mapValues(request, values) {
    let totals = [];
    request.orgUnits.forEach(orgUnit => {
      // reuse the data element from project descriptor
      let total = values.amountByOrgUnit(
        "HLPuaFB7Frw",
        "S34ULMcHMca",
        orgUnit.id,
        request.monthlyPeriods[2]
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
