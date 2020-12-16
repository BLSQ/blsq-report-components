import _ from "lodash";

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
  return a.toFixed(position);
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

export const generateCalculator = (hesabuPackage, orgunitid, period, activityFormulaCodes, packageFormulaCodes) => {
  let codes = ["calculator = { "];


  codes.push("setIndexedValues: function (val) { calculator.field_indexedValues = val}, ")
  codes.push("indexedValues: function () { return calculator.field_indexedValues}, ")

  codes.push("setDefaultCoc: function (val) { calculator.field_defaultCoc = val}, ")
  codes.push("defaultCoc: function () { return calculator.field_defaultCoc}, ")

  Object.keys(hesabuPackage.activity_formulas).forEach((k) => (hesabuPackage.activity_formulas[k].code = k));

  const allFormulaCodes = Object.keys(hesabuPackage.activity_formulas);

  const activityFormulas = Object.values(hesabuPackage.activity_formulas).filter((f) =>
    activityFormulaCodes.includes(f.code),
  );

  const stateOrFormulaCodes = Object.keys(hesabuPackage.activities[0]).filter((k) => k !== "name" && k !== "code");

  const states = stateOrFormulaCodes.filter((k) => !allFormulaCodes.includes(k));

  for (let activity of hesabuPackage.activities) {
    for (let state of states) {
      const field_name = `${hesabuPackage.code}_${activity.code}_${state}_${orgunitid}_${period}`;
      // getter
      codes.push(`${field_name}: function(){`);
      codes.push("    if (calculator.indexedValues()) {")
      codes.push("         const deCoc = \""+activity[state]+"\".split('.');")
      codes.push(`         const k = [\"${orgunitid}\", \"${period}\", deCoc[0], deCoc[1] || calculator.defaultCoc()].join("-");`)
      codes.push("         const v = calculator.indexedValues()[k]")
      codes.push("         if(v) { return parseFloat(v[0].value) }")
      codes.push("    }")
      codes.push(`   return calculator.field_${field_name} == undefined ? 0 : this.field_${field_name}`);
      codes.push("},");

      // setter
      codes.push(`set_${field_name}: function(val){`);
      codes.push(`   calculator.field_${field_name} = val`);
      codes.push("},");
    }
    for (let formula of activityFormulas) {
      let expandedformula = "" + formula.expression;
      codes.push("/* " + formula.expression + "*/");
      codes.push(`${hesabuPackage.code}_${activity.code}_${formula.code}_${orgunitid}_${period}: () => {`);
      const substitutions = { IF: "IFF" };
      for (let substit of stateOrFormulaCodes) {
        substitutions[substit] = `calculator.${hesabuPackage.code}_${activity.code}_${substit}_${orgunitid}_${period}()`;
      }

      const tokens = formula.expression.split(/([\w]+)|\"[\w\s]+\"/g);

      expandedformula = tokens.map((token) => substitutions[token] || token).join("");

      codes.push("  return " + expandedformula);

      codes.push("},");
    }
  }

  for (let formulaCode of Object.keys(hesabuPackage.formulas).filter((k) => packageFormulaCodes.includes(k))) {
    const substitutions = { IF: "IFF" };
    for (let substit of stateOrFormulaCodes) {
      substitutions["%{" + substit + "_values}"] = hesabuPackage.activities
        .map((activity) => `calculator.${hesabuPackage.code}_${activity.code}_${substit}_${orgunitid}_${period}()`)
        .join(" , ");
    }
    const tokens = hesabuPackage.formulas[formulaCode].expression
      .split(/(\%\{\w+\})/g)
      .filter((t) => t.startsWith("%{"));
    let expression = hesabuPackage.formulas[formulaCode].expression + "";
    for (let token of tokens) {
      expression = expression.replace(token, substitutions[token]);
    }
    /*  console.log(
      hesabuPackage.formulas[formulaCode].expression,
      " ==> \n",
      expression,
      "\n",
      tokens
    );*/

    codes.push(`${hesabuPackage.code}_${formulaCode}_${orgunitid}_${period}: function(){`);
    codes.push("   return " + expression);
    codes.push("},");
  }

  codes.push("}");
  codes.push("return calculator");
  const fullCode = codes.join("\n");
  console.log(fullCode);

  const calculator = new Function("SCORE_TABLE", "ABS", "ROUND", "IFF", "SAFE_DIV", "SUM", fullCode)(
    SCORE_TABLE,
    ABS,
    ROUND,
    IFF,
    SAFE_DIV,
    SUM,
  );
  return calculator;
};
