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

export const checkNonVisibleOverlap = (
  contract,
  mainContracts,
  subContracts,
  allContracts,
  allContractsOverlaps,
) => {
  let warnings;
  if (allContractsOverlaps[contract.id]) {
    allContractsOverlaps[contract.id].forEach((contractOverlapId) => {
      if (
        !mainContracts.find((mc) => mc.id === contractOverlapId) &&
        !subContracts.find((sc) => sc.id === contractOverlapId)
      ) {
        const notVisibleContract = allContracts.find(
          (c) => c.id === contractOverlapId,
        );
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
    if (
      !startDate ||
      (startDate &&
        moment(startDate).isAfter(moment(c.fieldValues.contract_start_date)))
    ) {
      startDate = c.fieldValues.contract_start_date;
    }
    if (
      !endDate ||
      (endDate &&
        moment(endDate).isBefore(moment(c.fieldValues.contract_end_date)))
    ) {
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
    moment(coverage.startDate).isAfter(
      moment(contract.fieldValues.contract_start_date),
    ) ||
    moment(coverage.endDate).isBefore(
      moment(contract.fieldValues.contract_end_date),
    )
  ) {
    return true;
  }
  return false;
};

export const getFilterIndexById = (filterId, filters) =>
  filters.findIndex((f) => f.id === filterId);

export const updateFilters = (value, filterId, filters) => {
  const newFilters = [...filters];
  const filterIndex = filters.findIndex((f) => f.id === filterId);
  if (filterIndex || filterIndex === 0) {
    newFilters[filterIndex].value = value;
  }
  return newFilters;
};

export const getFilterValueById = (filterId, filters) => {
  const filterIndex = getFilterIndexById(filterId, filters);
  let value;
  if (filterIndex && filters[filterIndex] && filters[filterIndex].value) {
    value = filters[filterIndex].value;
  }
  return value;
};

export const isToday = (dateString) =>
  moment(dateString, "MM/DD/YYYY").isSame(moment(), "day");
