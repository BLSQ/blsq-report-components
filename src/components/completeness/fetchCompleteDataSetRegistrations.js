import DatePeriods from "../../support/DatePeriods";

export const fetchCompleteDataSetRegistrations = async (api, quarterPeriod, DataEntries, accessibleZones) => {
  const periods = [quarterPeriod]
    .concat(DatePeriods.split(quarterPeriod, "monthly"))
    .concat(DatePeriods.split(quarterPeriod, "yearly"));

  const dataSets = DataEntries.getAllDataEntries().flatMap((de) => {
    if (de.dataSetId) {
      return [de.dataSetId];
    } else if (de.dataSetIds) {
      return de.dataSetIds;
    } else {
      return [];
    }
  });

  let completeDataSetRegistrations = [];
  for (let ou of accessibleZones) {
    const ds = await api.get("completeDataSetRegistrations", {
      orgUnit: ou.id,
      children: true,
      period: periods,
      dataSet: dataSets,
    });
    completeDataSetRegistrations = completeDataSetRegistrations.concat(ds.completeDataSetRegistrations);
  }

  completeDataSetRegistrations = completeDataSetRegistrations
    .filter((c) => c)
    .filter((c) => {
      // handle newer dhis2 version that has the completed flag
      if (c.hasOwnProperty("completed")) {
        return c.completed;
      }
      // else keep all records
      return true;
    });

  return completeDataSetRegistrations;
};