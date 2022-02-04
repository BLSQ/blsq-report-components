import PluginRegistry from "../../core/PluginRegistry";
import _ from "lodash";

const computeContractsByDataEntryCode = (allDataEntries, activeContracts, dataSetsById, period) => {
  const project = PluginRegistry.extension("hesabu.project");
  const contractsByDataEntryCode = {};
  for (let dataEntry of allDataEntries) {
    const dataEntryContracts = activeContracts.filter((activeContract) =>
      dataEntry.contracts.some((contractFilter) => contractFilter.every((code) => activeContract.codes.includes(code))),
    );
    const dataSets = dataEntry.dataSetId
      ? [dataSetsById[dataEntry.dataSetId]]
      : dataEntry.dataSetIds
      ? dataEntry.dataSetIds.map((id) => dataSetsById[id])
      : [];
    const results = [];
    for (let dataSet of dataSets) {
      const dataSetOrgunits = new Set(dataSet.organisationUnits.map((ou) => ou.id));
      const missingOrgunits = dataEntryContracts.map((c) => c.orgUnit).filter((ou) => !dataSetOrgunits.has(ou.id));

      let expectedDataElements = [];
      const missingDataElements = [];
      if (dataEntry.hesabuInputs) {
        const projectDescriptor = project(period);
        const payment = projectDescriptor.payment_rules[dataEntry.hesabuPayment];
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
  return contractsByDataEntryCode;
};

export const fetchDataSets = async (allDataEntries, period) => {
  const dhis2 = PluginRegistry.extension("core.dhis2");
  const api = await dhis2.api();
  const dataElements = _.keyBy(
    (await api.get("dataElements", { paging: false, fields: "id,name" })).dataElements,
    (de) => de.id,
  );
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
  const contractsByDataEntryCode = computeContractsByDataEntryCode(
    allDataEntries,
    activeContracts,
    dataSetsById,
    period,
  );
  return {
    contractsByDataEntryCode,
    dataElementsById: dataElements,
  };
};
