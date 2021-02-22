import _ from "lodash";
import generateCode from "./CodeGenerator"
import { functions } from "./FunctionRegistry"

const keys = Object.keys(functions)
const values = Object.values(functions)

export const generateCalculator = (hesabuPackage, orgunitid, period, activityFormulaCodes, packageFormulaCodes, orgUnit) => {

  const fullCode = generateCode(hesabuPackage, orgunitid, period, activityFormulaCodes, packageFormulaCodes, orgUnit)
  //console.log(fullCode);

  const calculator = new Function(...keys, fullCode)(
    ...values
  );

  return calculator

};
