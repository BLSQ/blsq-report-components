import DecisionTable from "./DecisionTable"
import { toOrgUnitFacts }  from "./CodeGenerator";
import _ from "lodash";

export const getVisibleAndOrderedActivities = (hesabuPackage, decisionPeriod, orgUnit) => {
  
  const decisionTables = hesabuPackage.activity_decision_tables
    .map((d) => new DecisionTable(d))
    .filter((dec) => dec.matchPeriod(decisionPeriod));

  const visibleDecisionTables = decisionTables.filter((dec) => {
    return dec.outHeaders.includes("visible");
  });
  let activities = hesabuPackage.activities.filter((activity) => {
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

  const newNameDecisionTables = decisionTables.filter((dec) => {
    return dec.outHeaders.includes("new_name");
  });

  const newNamesByActivityCode = {}
  for (let activity of activities) {
    for (let decisionTable of newNameDecisionTables) {
      const facts = toOrgUnitFacts(orgUnit, decisionTable);
      facts["activity_code"] = activity.code;
      const matchingLine = decisionTable.matchingRule(facts);
      if (matchingLine) {
        newNamesByActivityCode[activity.code] = matchingLine.new_name;
      }
    }
  }
  
  return activities.map(activity => {
    const act = _.clone(activity)
    act.old_name = act.name 
    act.name = newNamesByActivityCode[activity.code] || act.name
    return act
  });
};
