class Mapper {
  mapValues(request, values) {

    const invoice = {
      orgUnit: request.mainOrgUnit,
      orgUnits: request.orgUnits,
      year: request.year,
      quarter: request.quarter,
      activities: [],
      totals: {}
    };
    return invoice;
  }
}

export default Mapper;
