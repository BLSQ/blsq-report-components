import _ from "lodash";
import generateCode from "./CodeGenerator"
const SAFE_DIV = (a, b) => {
  if (b !== 0) {
    return a / b;
  }
  return 0;
};

const IFF = (a, b, c) => {
  return a ? b : c;
};
const ROUND = (a, position) => {
  if (a== undefined) {
    return 0
  }
  const fixed = a.toFixed(position)
  return parseFloat(fixed);
};

const SCORE_TABLE = (...args) => {
  const target = args[0];
  const slices = _.chunk(args.slice(1), 3);

  for (let slice of slices) {
    if (slice.length == 3) {
      const lower = slice[0];
      const greater = slice[1];
      const thenvalue = slice[2];
      if (lower <= target && target < greater) {
        return thenvalue;
      }
    } else {
      return slice[0];
    }
  }
  return target;
};

const ABS = (x) => Math.abs(x);

const SUM = (...args) => {
  let a = 0;
  for (let arg of args) {
    a += arg;
  }
  return a;
};

export const generateCalculator = (hesabuPackage, orgunitid, period, activityFormulaCodes, packageFormulaCodes, orgUnit) => {

  const fullCode = generateCode(hesabuPackage, orgunitid, period, activityFormulaCodes, packageFormulaCodes, orgUnit)
  //console.log(fullCode);

  const calculator = new Function("SCORE_TABLE", "ABS", "ROUND", "IFF", "SAFE_DIV", "SUM", "sum", fullCode)(
    SCORE_TABLE,
    ABS,
    ROUND,
    IFF,
    SAFE_DIV,
    SUM,
    SUM,
  );

  return calculator

};
