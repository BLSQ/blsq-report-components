import React from "react";
import PluginRegistry from "../core/PluginRegistry";
import _ from "lodash";

export const fetchDataSets = async (allDataEntries, period) => {
  // setLoading(true);
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const project = PluginRegistry.extension("hesabu.project");
  const api = await dhis2.api();
  const dataElements = _.keyBy(
    (await api.get("dataElements", { paging: false, fields: "id,name" })).dataElements,
    (de) => de.id,
  );
  // setDataElementsById(dataElements);
  const dataSetIds = allDataEntries.flatMap((d) => (d.dataSetId ? [d.dataSetId] : d.dataSetIds));
  const ds = await api.get("dataSets", {
    filter: ["id:in:[" + dataSetIds.join(",") + "]"],
    paging: false,
    fields: ":all,dataSetElements[dataElement[id,name]]organisationUnits[id,name],workflow[:all]",
  });
  const dataSetsById = _.keyBy(ds.dataSets, (d) => d.id);

  const contractService = PluginRegistry.extension("contracts.service");
  const contracts = await contractService.findAll();

  const activeContracts = contracts.filter((contract) => contract.matchPeriod(period));
  const contractsByDataEntryCode = {};
  for (let dataEntry of allDataEntries) {
    const dataEntryContracts = activeContracts.filter((activeContract) =>
      dataEntry.contracts.some((contractFilter) =>
        contractFilter.every((code) => activeContract.codes.includes(code)),
      ),
    );
    const dataSets = dataEntry.dataSetId
      ? [dataSetsById[dataEntry.dataSetId]]
      : dataEntry.dataSetIds
      ? dataEntry.dataSetIds.map((id) => dataSetsById[id])
      : [];
    const results = [];
    for (let dataSet of dataSets) {
      contractsByDataEntryCode[dataEntry.code];
      const dataSetOrgunits = new Set(dataSet.organisationUnits.map((ou) => ou.id));
      const missingOrgunits = dataEntryContracts.map((c) => c.orgUnit).filter((ou) => !dataSetOrgunits.has(ou.id));

      let expectedDataElements = [];
      const missingDataElements = [];
      if (dataEntry.hesabuInputs) {
        const project_descriptor = project(period);
        const payment = project_descriptor.payment_rules[dataEntry.hesabuPayment];
        const hesabuPackage = payment.packages[dataEntry.hesabuPackage];
        expectedDataElements = hesabuPackage.activities
          .flatMap((activity) => dataEntry.hesabuInputs.map((state) => activity[state]))
          .filter((de) => de);
        const dataSetElements = new Set(dataSet.dataSetElements.map((dse) => dse.dataElement.id));
        for (let expectedDE of expectedDataElements) {
          if (expectedDE && !dataSetElements.has(expectedDE)) {
            missingDataElements.push(expectedDE);
          }
        }
      }

      results.push({
        dataSet: dataSet,
        activeContracts: dataEntryContracts,
        missingOrgunits: missingOrgunits,
        expectedDataElements: expectedDataElements,
        missingDataElements: missingDataElements,
      });
    }
    contractsByDataEntryCode[dataEntry.code] = results;
  }
  // setContractsByDataEntryCode(contractsByDataEntryCode);
  // setLoading(false);
  return {
    contractsByDataEntryCode,
    dataElementsById: dataElements,

  }
};