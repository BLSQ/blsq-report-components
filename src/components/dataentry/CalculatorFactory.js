import _ from "lodash";
import generateCode from "./CodeGenerator";
import { functions } from "./FunctionRegistry";

const keys = Object.keys(functions);
const values = Object.values(functions);

export const generateCalculator = (
  hesabuPackage,
  orgunitid,
  period,
  activityFormulaCodes,
  packageFormulaCodes,
  orgUnit,
) => {
  const fullCode = generateCode(hesabuPackage, orgunitid, period, activityFormulaCodes, packageFormulaCodes, orgUnit);
  try {
    const calculator = new Function(...keys, fullCode)(...values);

    return calculator;
  } catch (error) {
    console.log("ERROR", error.message, fullCode);
    throw new Error(error.message + "\n\n the generated code is probably not syntactically correct : \n\n" + fullCode);
  }
};
