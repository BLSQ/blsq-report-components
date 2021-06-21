import moment from "moment";
import qs from "qs";
import { contractsTableColumns, orgUnitContractTableOptions } from "../config";

export const getOverlaps = (contractId, contractsOverlaps, contractsById) => {
  if (!contractsOverlaps[contractId]) {
    return [];
  }
  return Array.from(contractsOverlaps[contractId]).map((contractId) => contractsById[contractId]);
};

export const getOrgUnitAncestors = (orgUnit) => {
  if (orgUnit && orgUnit.ancestors) {
    return orgUnit.ancestors
      .slice(1, -1)
      .map((a) => a.name)
      .join(" > ");
  }
  return "";
};

export const encodeTableQueryParams = (location, key, value) => {
  let queryParams = {
    ...qs.parse(location.search.substr(1)),
    [key]: value,
  };
  queryParams = qs.stringify(queryParams);
  return queryParams;
};

export const decodeTableQueryParams = (location) => {
  let queryParams = {
    ...qs.parse(location.search.substr(1)),
  };
  const tableParams = {
    page: queryParams.page ? parseInt(queryParams.page, 10) : 0,
    sort: queryParams.sort || { column: "", direction: "" },
    rowsPerPage: queryParams.rowsPerPage ? parseInt(queryParams.rowsPerPage, 10) : 10,
  };
  return tableParams;
};

export const getOptionFromField = (field, code) => {
  const option = field.optionSet.options.find((o) => o.code === code);
  if (!code) {
    return {
      label: "",
      value: undefined,
    };
  }
  return {
    label: option ? option.name : code,
    value: code,
  };
};

export const getNonStandartContractFields = (contractFields) => contractFields.filter((c) => !c.standardField);

export const getNonStandartContractFieldValue = (contract, field) =>
  (contract.fieldValues && getOptionFromField(field, contract.fieldValues[field.code]).label) || "--";

export const getContractByOrgUnit = (contracts = [], orgUnitId) => contracts.find((c) => c.orgUnit.id === orgUnitId);

export const getContractTableProps = (
  t,
  classes,
  contractsData,
  allContracts,
  fetchContracts,
  location,
  contractFields,
  columnsFilterArray,
  displayOrgUnit,
  displayMainOrgUnit,
  withIndex,
) => {
  const options = orgUnitContractTableOptions(t);
  const overlapsTotal = Object.keys(contractsData.contractsOverlaps).length;
  const columns = contractsTableColumns(
    t,
    classes,
    contractsData.contracts,
    contractFields,
    location,
    () => fetchContracts(),
    true,
    allContracts,
    displayOrgUnit,
    displayMainOrgUnit,
    withIndex,
  ).filter((c) => !columnsFilterArray.includes(c.name));
  return {
    options,
    columns,
    overlapsTotal,
  };
};

export const checkNonVisibleOverlap = (contract, mainContracts, subContracts, allContracts, allContractsOverlaps) => {
  let warnings;
  if (allContractsOverlaps[contract.id]) {
    allContractsOverlaps[contract.id].forEach((contractOverlapId) => {
      if (
        !mainContracts.find((mc) => mc.id === contractOverlapId) &&
        !subContracts.find((sc) => sc.id === contractOverlapId)
      ) {
        const notVisibleContract = allContracts.find((c) => c.id === contractOverlapId);
        if (notVisibleContract) {
          if (!warnings) {
            warnings = [];
          }
          warnings.push(notVisibleContract);
        }
      }
    });
  }
  return warnings;
};

export const getOrgUnitCoverage = (mainContracts) => {
  let startDate;
  let endDate;
  mainContracts.forEach((c) => {
    if (!startDate || (startDate && moment(startDate).isAfter(moment(c.fieldValues.contract_start_date)))) {
      startDate = c.fieldValues.contract_start_date;
    }
    if (!endDate || (endDate && moment(endDate).isBefore(moment(c.fieldValues.contract_end_date)))) {
      endDate = c.fieldValues.contract_end_date;
    }
  });
  return {
    startDate,
    endDate,
  };
};

export const checkSubContractCoverage = (contract, coverage) => {
  if (
    moment(coverage.startDate).isAfter(moment(contract.fieldValues.contract_start_date)) ||
    moment(coverage.endDate).isBefore(moment(contract.fieldValues.contract_end_date))
  ) {
    return true;
  }
  return false;
};

export const detailInitialState = {
  allContracts: [],
  allContractsOverlaps: {},
  subContracts: {
    contracts: [],
    contractsById: null,
    contractsOverlaps: {},
  },
  mainContracts: {
    contracts: [],
    contractsById: null,
    contractsOverlaps: {},
  },
  contractFields: [],
};

export const getMainOrgUnit = (allContracts, orgUnitId) => {
  let mainOrgUnit;
  const tempContract = allContracts.find((c) => c.orgUnit.id === orgUnitId);
  if (tempContract) {
    mainOrgUnit = tempContract.orgUnit;
  }
  return mainOrgUnit;
};

export const defaultContract = (fieldValues) => ({
  id: 0,
  orgUnit: null,
  codes: [],
  fieldValues,
  children: null,
});

export const cloneContractWithoutId = (contract) => {
  return {
    ...contract,
    id: 0,
  };
};

export const findLastContract = (contracts) => {
  const sortedContracts = _.orderBy(contracts, ["endPeriod"], ["desc"]);
  let contract = _.head(sortedContracts);
  let defaultContract = cloneContractWithoutId(contract);
  return defaultContract;
};
