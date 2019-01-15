class Mapper {
  mapValues(request, values) {
    const invoice = {
        orgUnit: request.orgUnit,
        orgUnits: request.orgUnits,
        year: request.year,
        quarter: request.quarter,
        activities: [],
        total: {}
      };
      return invoice;

  }
}


export default Mapper