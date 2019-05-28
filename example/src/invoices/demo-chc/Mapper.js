import { Dhis2 } from "@blsq/blsq-report-components";
import config from "../Config";
class Mapper {
  mapValues(request, values) {
    const dhis2 = new Dhis2();
    const signatures= {
        sign1: dhis2.getFileDataValue({de: config.global.signatures[0], ou:request.orgUnit.ancestors[1].id, pe: request.year}, dhis2.url),
        sign2: dhis2.getFileDataValue({de: config.global.signatures[1], ou:request.orgUnit.ancestors[1].id, pe: request.year}, dhis2.url)
      };

    const invoice = {
      orgUnit: request.orgUnit,
      orgUnits: request.orgUnits,
      year: request.year,
      quarter: request.quarter,
      activities: [],
      total: {},
      values: values.values,
      signatures: signatures
    };
    return invoice;
  }
}

export default Mapper;
