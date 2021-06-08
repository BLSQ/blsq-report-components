export const toCompleteness = (contracts, completeDataSetRegistrations, DataEntries, quarterPeriod, invoiceAppUrl) => {
  const completeDataSetRegistrationsByOrgUnitId = _.groupBy(
    completeDataSetRegistrations,
    (cdsr) => cdsr.organisationUnit,
  );
  const results = [];
  for (let contract of contracts) {
    const expectedDataEntries = DataEntries.getExpectedDataEntries(contract, quarterPeriod);
    if (expectedDataEntries.length > 0) {
      const completedDataEntries = completeDataSetRegistrationsByOrgUnitId[contract.orgUnit.id] || [];

      if (completedDataEntries.length > 0) {
        for (let expectedDataEntry of expectedDataEntries) {
          if (expectedDataEntry.dataEntryType.dataSetId) {
            expectedDataEntry.completedDataEntries = completedDataEntries.filter(
              (c) => c.dataSet == expectedDataEntry.dataEntryType.dataSetId && c.period == expectedDataEntry.period,
            );
            expectedDataEntry.completed = expectedDataEntry.completedDataEntries.length > 0 ? 1 : 0;
          } else if (expectedDataEntry.dataEntryType.dataSetIds) {
            expectedDataEntry.completedDataEntries = completedDataEntries.filter(
              (c) =>
                expectedDataEntry.dataEntryType.dataSetIds.includes(c.dataSet) && c.period == expectedDataEntry.period,
            );
            expectedDataEntry.completed =
              expectedDataEntry.completedDataEntries.length == expectedDataEntry.dataEntryType.dataSetIds.length
                ? 1
                : 0;
          }
        }
      }

      const completedCount = expectedDataEntries.filter((c) => c.completed).length;
      const record = {
        contract,
        expectedDataEntries,
        completedDataEntries,
        completedCount: completedCount,
        expectedCount: expectedDataEntries.length,
        completionRatio:
          expectedDataEntries.length > 0 ? ((completedCount / expectedDataEntries.length) * 100).toFixed(2) : undefined,
      };

      if (contract.orgUnit.ancestors) {
        contract.orgUnit.ancestors.forEach((ancestor, index) => {
          record["orgUnitLevel" + index] = ancestor;
        });
      }
      results.push(record);
    }
  }

  const dataentries = _.groupBy(
    results.flatMap((r) => r.expectedDataEntries),
    (r) => (r.dataEntryType.category || r.dataEntryType.name) + "-" + r.period,
  );
  const distinctDataEntries = Object.values(dataentries);
  for (let info of results) {
    for (let dataEntryPeriods of distinctDataEntries) {
      for (let dataEntryPeriod of dataEntryPeriods) {
        if (dataEntryPeriod.dataEntryType.category == undefined) {
          dataEntryPeriod.dataEntryType.category = dataEntryPeriod.dataEntryType.name;
        }
      }
      const ex = info.expectedDataEntries.find((ex) =>
        dataEntryPeriods.some((ex3) => ex.dataEntryType.code == ex3.dataEntryType.code && ex.period == ex3.period),
      );

      const prefix = dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category;
      info[prefix] = ex;

      info[prefix + "-link"] = ex
        ? (invoiceAppUrl || "") +
          "#/dataEntry/" +
          info.contract.orgUnit.id +
          "/" +
          ex.period +
          "/" +
          ex.dataEntryType.code
        : undefined;

      if (ex && ex.completed) {
        info[prefix + "-users"] = ex.completedDataEntries.map((e) => e.storedBy).join("\n");
        info[prefix + "-dates"] = ex.completedDataEntries.map((e) => e.date).join("\n");
      }

      info[prefix + "-completed"] = ex ? (ex.completed ? 1 : 0) : 0;

      info[prefix + "-expected"] = ex ? 1 : 0;
    }
  }
  return { distinctDataEntries, results };
};

export const buildStatsByZone = (results, distinctDataEntries) => {
  const statsByZone = [];
  const contractsByZone = _.groupBy(results, (c) =>
    c.contract.orgUnit.ancestors[2] ? c.contract.orgUnit.ancestors[2].id : undefined,
  );
  for (let contractsForZone of Object.values(contractsByZone)) {
    const parentZone = contractsForZone[0].contract.orgUnit.ancestors[1];
    const zone = contractsForZone[0].contract.orgUnit.ancestors[2];
    const stats = { orgUnit: zone, ancestor: parentZone };

    for (let info of contractsForZone) {
      for (let dataEntryPeriods of distinctDataEntries) {
        const key = dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category + "-completed";

        let count = info[key];
        let currentCount = stats[key];

        if (currentCount !== undefined) {
          stats[key] = currentCount + count;
        } else {
          stats[key] = count;
        }

        const keyExpected = dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category + "-expected";
        count = info[keyExpected];
        currentCount = stats[keyExpected];

        if (currentCount !== undefined) {
          stats[keyExpected] = currentCount + count;
        } else {
          stats[keyExpected] = count;
        }

        const keyRatio = dataEntryPeriods[0].period + "-" + dataEntryPeriods[0].dataEntryType.category + "-ratio";
        stats[keyRatio] = stats[keyExpected] ? ((stats[key] / stats[keyExpected]) * 100).toFixed(2) : undefined;
      }
    }

    statsByZone.push(stats);
  }
  return statsByZone;
};
