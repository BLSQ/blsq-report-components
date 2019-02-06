class Mapper {
  mapValues(request, values) {
    const period = request.period;
    let totals = [];
    values.values.dataValues.forEach(value => {
      let total = values.amount(
        value.dataElement + "." + value.categoryOptionCombo,
        period
      );
      totals.push(total);
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
