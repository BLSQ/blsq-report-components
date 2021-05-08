import PapaParse from "papaparse";
import DecisionTable from "./DecisionTable";

export const tokenize = (expression) => expression.split(/([\w]+)|\"[\w\s]+\"/g);

export const valuesDependencies = (expression) => expression.split(/(\%\{\w+\})/g).filter((t) => t.startsWith("%{"));

export const defaultSubstitutions = () => {
  return { IF: "IFF", sum: "SUM", " =": "==", "=": "==" };
};

export const generateGetterSetterForState = (hesabuPackage, activity, state, orgunitid, period) => {
  const codes = [];
  const field_name = `${hesabuPackage.code}_${activity.code}_${state}_${orgunitid}_${period}`;
  // getter
  codes.push(`${field_name}: function(){`);
  codes.push("    if (calculator.indexedValues()) {");
  codes.push('         const deCoc = "' + activity[state] + "\".split('.');");
  codes.push(
    `         const k = [\"${orgunitid}\", \"${period}\", deCoc[0], deCoc[1] || calculator.defaultCoc()].join("-");`,
  );
  codes.push("         const v = calculator.indexedValues()[k]");
  codes.push('         if(v && v[0].value == "") { return 0 }');
  codes.push("         if(v) { return parseFloat(v[0].value) }");
  codes.push("    }");
  codes.push(`   return calculator.field_${field_name} == undefined ? 0 : this.field_${field_name}`);
  codes.push("},");

  // setter
  codes.push(`set_${field_name}: function(val){`);
  codes.push(`   calculator.field_${field_name} = val`);
  codes.push("},");

  return codes.join("\n");
};

export const generateIsNullForState = (hesabuPackage, activity, state, orgunitid, period) => {
  const codes = [];
  const field_name = `${hesabuPackage.code}_${activity.code}_${state}_${orgunitid}_${period}`;
  const function_name = `${hesabuPackage.code}_${activity.code}_${state}_is_null_${orgunitid}_${period}`;
  codes.push(`${function_name}: function(){`);
  codes.push("    if (calculator.indexedValues()) {");
  codes.push('         const deCoc = "' + activity[state] + "\".split('.');");
  codes.push(
    `         const k = [\"${orgunitid}\", \"${period}\", deCoc[0], deCoc[1] || calculator.defaultCoc()].join("-");`,
  );
  codes.push("         const v = calculator.indexedValues()[k]");
  codes.push("         if(v && v[0] && v[0].value) { return 0 } else return 1");
  codes.push("    }");
  codes.push(
    `   return (calculator.field_${field_name} === undefined  || calculator.field_${field_name} === null || calculator.field_${field_name} === "") ? 1 : 0`,
  );
  codes.push("},");
  return codes.join("\n");
};

export const generateActivityFormula = (hesabuPackage, activity, formula, orgunitid, period, stateOrFormulaCodes) => {
  let expandedformula = "" + formula.expression;
  const substitutions = defaultSubstitutions();
  for (let substit of stateOrFormulaCodes) {
    substitutions[substit] = `calculator.${hesabuPackage.code}_${activity.code}_${substit}_${orgunitid}_${period}()`;
    substitutions[
      substit + "_is_null"
    ] = `calculator.${hesabuPackage.code}_${activity.code}_${substit}_is_null_${orgunitid}_${period}()`;
  }
  if (hesabuPackage.activity_decision_tables) {
    for (let rawDecisionTable of hesabuPackage.activity_decision_tables) {
      for (let substit of rawDecisionTable.out_headers) {
        substitutions[
          substit
        ] = `calculator.${hesabuPackage.code}_${activity.code}_${substit}_${orgunitid}_${period}()`;
      }
    }
  }

  const tokens = tokenize(formula.expression);

  expandedformula = tokens.map((token) => substitutions[token] || token).join("");
  if (expandedformula.includes("%{")) {
    throw new Error(
      `Unsupported feature for ${formula.code} : ${expandedformula}, probably need to ignore the formula`,
    );
  }

  const codes = [];
  codes.push("/* " + formula.expression + "*/");
  codes.push(`${hesabuPackage.code}_${activity.code}_${formula.code}_${orgunitid}_${period}: () => {`);
  codes.push("  return " + expandedformula);
  codes.push("},");
  return codes.join("\n");
};

export const generatePackageFormula = (hesabuPackage, formulaCode, orgunitid, period, stateOrFormulaCodes) => {
  const substitutions = defaultSubstitutions();
  for (let substit of stateOrFormulaCodes) {
    substitutions["%{" + substit + "_values}"] = hesabuPackage.activities
      .map((activity) => `calculator.${hesabuPackage.code}_${activity.code}_${substit}_${orgunitid}_${period}()`)
      .join(" , ");
  }

  let expression = hesabuPackage.formulas[formulaCode].expression + "";

  const tokens = tokenize(expression);
  // references between package formulas
  for (let otherFormulaCode of Object.keys(hesabuPackage.formulas)) {
    substitutions[otherFormulaCode] = `calculator.${hesabuPackage.code}_${otherFormulaCode}_${orgunitid}_${period}()`;
  }
  expression = tokens.map((token) => substitutions[token] || token).join("");

  // handle %{..._values} to for all activities
  const valuesTokens = valuesDependencies(hesabuPackage.formulas[formulaCode].expression);

  for (let token of valuesTokens) {
    expression = expression.replace(token, substitutions[token]);
  }

  const codes = [];
  codes.push(`${hesabuPackage.code}_${formulaCode}_${orgunitid}_${period}: function(){`);
  codes.push("   return " + expression);
  codes.push("},");
  return codes.join("\n");
};

export const generateDecisionTable = (hesabuPackage, activity, decisionTable, orgUnit, period) => {
  const orgunitid = orgUnit.id;
  let selectedRows = decisionTable.data;
  const facts = {
    activity_code: activity.code,
  };

  const remainingInHeaders = decisionTable.inHeaders.filter((h) => h !== "activity_code").map((h) => h.slice("groupset_code_".length));
  const contract = orgUnit.activeContracts[0];

  for (let field of remainingInHeaders) {
    const currentValue = contract.fieldValues[field];
    facts["groupset_code_" + field] = currentValue;

  }

  const matchedRule = decisionTable.matchingRule(facts);

  const codes = [];
  if (matchedRule == undefined) {
    for (let outHeader of decisionTable.outHeaders) {
      codes.push("/* decision table" + JSON.stringify(matchedRule) + " */");
      codes.push(`${hesabuPackage.code}_${activity.code}_${outHeader}_${orgunitid}_${period}: () => {`);
      codes.push("  return 0;");
      codes.push("},");
    }
  } else {
    for (let outHeader of decisionTable.outHeaders) {
      codes.push("/* decision table" + JSON.stringify(matchedRule) + " */");
      codes.push(`${hesabuPackage.code}_${activity.code}_${outHeader}_${orgunitid}_${period}: () => {`);
      codes.push("  return " + matchedRule[outHeader]);
      codes.push("},");
    }
  }
  return codes.join("\n");
};

export const generateCode = (hesabuPackage, orgunitid, period, activityFormulaCodes, packageFormulaCodes, orgUnit) => {
  let codes = ["calculator = { "];

  codes.push("setIndexedValues: function (val) { calculator.field_indexedValues = val}, ");
  codes.push("indexedValues: function () { return calculator.field_indexedValues}, ");

  codes.push("setDefaultCoc: function (val) { calculator.field_defaultCoc = val}, ");
  codes.push("defaultCoc: function () { return calculator.field_defaultCoc}, ");

  Object.keys(hesabuPackage.activity_formulas).forEach((k) => (hesabuPackage.activity_formulas[k].code = k));

  const allFormulaCodes = Object.keys(hesabuPackage.activity_formulas);

  const activityFormulas = Object.values(hesabuPackage.activity_formulas).filter((f) =>
    activityFormulaCodes.includes(f.code),
  );

  const stateOrFormulaCodes = Array.from(
    new Set(
      Object.keys(hesabuPackage.activities[0])
        .filter((k) => k !== "name" && k !== "code")
        .concat(allFormulaCodes),
    ),
  );

  const states = stateOrFormulaCodes.filter((k) => !allFormulaCodes.includes(k));

  for (let activity of hesabuPackage.activities) {
    // states getter/setter
    for (let state of states) {
      codes.push(generateGetterSetterForState(hesabuPackage, activity, state, orgunitid, period));
    }

    // state is_null
    for (let state of states) {
      codes.push(generateIsNullForState(hesabuPackage, activity, state, orgunitid, period));
    }

    // activityFormulas
    for (let formula of activityFormulas) {
      codes.push(generateActivityFormula(hesabuPackage, activity, formula, orgunitid, period, stateOrFormulaCodes));
    }
    // decision tables
    if (hesabuPackage.activity_decision_tables) {
      for (let rawDecisionTable of hesabuPackage.activity_decision_tables) {
        const decisionTable = new DecisionTable(rawDecisionTable);
        if (decisionTable.matchPeriod(period)) {
          codes.push(generateDecisionTable(hesabuPackage, activity, decisionTable, orgUnit, period));
        }
      }
    }
  }

  // package formulas
  for (let formulaCode of Object.keys(hesabuPackage.formulas).filter((k) => packageFormulaCodes.includes(k))) {
    codes.push(generatePackageFormula(hesabuPackage, formulaCode, orgunitid, period, stateOrFormulaCodes));
  }

  codes.push("}");
  codes.push("return calculator");
  const fullCode = codes.join("\n");
  //console.log(fullCode)
  return fullCode;
};

export default generateCode;
