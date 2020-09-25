import moment from "moment";
import qs from "qs";
import DatePeriods from "../../support/DatePeriods";
import { contractsTableColumns, orgUnitContractTableOptions } from "./config";

export const getFilteredContracts = (filters, contracts, contractsOverlaps) => {
  let filteredContracts = contracts;
  Object.keys(filters).forEach((filterKey) => {
    const filter = filters[filterKey];
    filteredContracts = filteredContracts.filter((c) => {
      return (
        (filter === "overlaps" &&
          contractsOverlaps[c.id] &&
          contractsOverlaps[c.id].size > 0) ||
        c.codes.includes(filter) ||
        c.orgUnit.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.startPeriod.includes(filter) ||
        c.endPeriod.includes(filter)
      );
    });
  });
  return filteredContracts;
};

export const getOverlaps = (contractId, contractsOverlaps, contractsById) => {
  if (!contractsOverlaps[contractId]) {
    return [];
  }
  return Array.from(contractsOverlaps[contractId]).map(
    (contractId) => contractsById[contractId],
  );
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

export const filterItems = (filters, items, extra) => {
  let filteredItems = [...items];
  filters.forEach((filter) => {
    filteredItems = filter.onFilter(filter.value, filteredItems, extra);
  });
  return filteredItems;
};

export const getStartMonthFromQuarter = (startPeriod) => {
  const startPeriodMonths = DatePeriods.split(startPeriod, "monthly");
  return DatePeriods.monthName(startPeriodMonths[0]);
};

export const getEndMonthFromQuarter = (endPeriod) => {
  const endPeriodMonths = DatePeriods.split(endPeriod, "monthly");
  return DatePeriods.monthName(endPeriodMonths[endPeriodMonths.length - 1]);
};

export const getStartDateFromPeriod = (startPeriod) => {
  const startPeriodMonths = DatePeriods.split(startPeriod, "monthly");
  return moment(startPeriodMonths[0], "YYYYMM");
};
export const getEndDateFromPeriod = (endPeriod) => {
  const endPeriodMonths = DatePeriods.split(endPeriod, "monthly");
  return moment(endPeriodMonths[endPeriodMonths.length - 1], "YYYYMM").endOf(
    "month",
  );
};
export const getQuarterFromDate = (date) => {
  const month = parseInt(moment(date).format("MM"), 10);
  const year = moment(date).format("YYYY");
  return DatePeriods.dhis2QuarterPeriod(year, month);
};

export const getContractDates = (contract) => ({
  startDate: getStartDateFromPeriod(contract.startPeriod),
  endDate: getEndDateFromPeriod(contract.endPeriod),
});

export const encodeFiltersQueryParams = (location, filters) => {
  let queryParams = {
    ...qs.parse(location.search.substr(1)),
  };
  filters.forEach((f) => {
    queryParams[f.id] = f.urlEncode ? f.urlEncode(f.value) : f.value;
  });
  queryParams = qs.stringify(queryParams);
  return queryParams;
};

export const decodeFiltersQueryParams = (location, filters) => {
  const filtersFromUrl = qs.parse(location.search.substr(1));
  const newFilters = [];
  filters.forEach((f, index) => {
    let queryValue = f.urlDecode
      ? f.urlDecode(filtersFromUrl[f.id])
      : filtersFromUrl[f.id];
    newFilters[index] = {
      ...f,
      value: queryValue || f.value,
    };
  });
  return newFilters;
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
    rowsPerPage: queryParams.rowsPerPage
      ? parseInt(queryParams.rowsPerPage, 10)
      : 10,
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

export const getNonStandartContractFields = (contractFields) =>
  contractFields.filter((c) => !c.standardField);

export const getNonStandartContractFieldValue = (contract, field) =>
  (contract.fieldValues &&
    getOptionFromField(field, contract.fieldValues[field.code]).label) ||
  "--";

export const getContractByOrgUnit = (contracts = [], orgUnitId) =>
  contracts.find((c) => c.orgUnit.id === orgUnitId);

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
  const options = orgUnitContractTableOptions(
    t,
    contractsData.contracts,
    contractsData.contractsById,
    contractsData.contractsOverlaps,
    classes,
  );
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
