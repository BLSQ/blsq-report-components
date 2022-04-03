import DecisionTable from "./DecisionTable"
import { toOrgUnitFacts }  from "./CodeGenerator";
import _ from "lodash";

export const getVisibleAndOrderedActivities = (quantityPackage, decisionPeriod, orgUnit) => {
  const decisionTables = quantityPackage.activity_decision_tables
    .map((d) => new DecisionTable(d))
    .filter((dec) => dec.matchPeriod(decisionPeriod));

  const visibleDecisionTables = decisionTables.filter((dec) => {
    return dec.outHeaders.includes("visible");
  });
  let activities = quantityPackage.activities.filter((activity) => {
    if (visibleDecisionTables.length == 0) {
      return true;
    }
    return visibleDecisionTables.some((decisionTable) => {
      const facts = toOrgUnitFacts(orgUnit, decisionTable);
      facts["activity_code"] = activity.code;
      const matchingLine = decisionTable.matchingRule(facts);
      return matchingLine && matchingLine.visible == "1";
    });
  });

  const orderDecisionTables = decisionTables.filter((dec) => {
    return dec.outHeaders.includes("order");
  });

  const orderByActivityCode = {};
  for (let activity of activities) {
    for (let decisionTable of orderDecisionTables) {
      const facts = toOrgUnitFacts(orgUnit, decisionTable);
      facts["activity_code"] = activity.code;
      const matchingLine = decisionTable.matchingRule(facts);
      if (matchingLine) {
        orderByActivityCode[activity.code] = parseFloat(matchingLine.order);
      }
    }
  }

  if (Object.keys(orderByActivityCode).length > 0) {
    activities = _.sortBy(activities, (a) => orderByActivityCode[a.code]);
  }
  return activities;
};
