import moment from "moment";
import { getOptionFromField, getNonStandartContractFields } from "./utils/index";
import { getContractDates } from "./utils/periodsUtils";

/**
 * A Filters list
 * @typedef {Array} Filters
 * @typedef {Object} Filter
 * @property {string} id - Uid, fo the input, also used in url
 * @property {string} key - Key label used by the translation tool
 * @property {string} keyInfo - Optionnal - Key of the info tooltip used by the translation tool
 * @property {string} type - Type of filter to display (search, date, array)
 * @property {number} column - column where to display the filter (1, 2 ,3, 4, ...) - max is the value of columnsCount
 * @property {any} value - default value
 * @property {function} onFilter - function used to filter the items
 * @property {array} options - Optionnal - array of options for the select type
 * @property {string} label - label of the option
 * @property {any} value - value of the option
 * @property {function} urlEncode - Optionnal - function used encode filter into url
 * @property {function} urlDecode - Optionnal - function used decode filter from url
 */

export const activeAtFilter = {
  id: "active_at",
  key: "contracts.activeAt",
  type: "date",
  column: 2,
  value: null,
  onFilter: (value, contracts) => {
    if (!value) {
      return contracts;
    }
    const filteredContracts = contracts.filter((c) => {
      const contractDates = getContractDates(c);
      return moment(value).isBetween(contractDates.startDate, contractDates.endDate);
    });
    return filteredContracts;
  },
  urlDecode: (value) => (!value || value === "" ? null : value),
};

export const activeToday = {
  id: "active_today",
  key: "contracts.activeToday",
  type: "checkbox",
  column: 2,
  value: false,
  onFilter: (value, contracts) => {
    if (!value) {
      return contracts;
    }
    const filteredContracts = contracts.filter((c) => {
      const contractDates = getContractDates(c);
      return moment().isBetween(contractDates.startDate, contractDates.endDate);
    });
    return filteredContracts;
  },
  urlEncode: (value) => (value ? "true" : "false"),
  urlDecode: (value) => value === "true",
};

export const columnsCount = 4;
const defaultFilters = [
  {
    id: "search",
    key: "search",
    keyInfo: "contracts.searchInfos",
    type: "search",
    column: 1,
    value: "",
    onFilter: (value, contracts) =>
      contracts.filter(
        (c) =>
          c.codes.includes(value) ||
          c.orgUnit.name.toLowerCase().includes(value.toLowerCase()) ||
          c.startPeriod.includes(value) ||
          c.endPeriod.includes(value),
      ),
  },
  {
    ...activeAtFilter,
  },
  {
    id: "only_overlaps",
    key: "contracts.onlyOverlaps",
    type: "checkbox",
    column: 1,
    value: false,
    onFilter: (onlyOverlaps, contracts, contractsOverlaps) => {
      if (!onlyOverlaps) {
        return contracts;
      }
      return contracts.filter((c) => contractsOverlaps[c.id] && contractsOverlaps[c.id].size > 0);
    },
    urlEncode: (value) => (value ? "true" : "false"),
    urlDecode: (value) => value === "true",
  },
  {
    id: "only_sub_contracts",
    key: "contracts.onlySubContracts",
    type: "checkbox",
    column: 2,
    value: false,
    onFilter: (onlySubContracts, contracts, contractsOverlaps) => {
      if (!onlySubContracts) {
        return contracts;
      }
      return contracts.filter((c) => c.fieldValues.contract_main_orgunit && c.fieldValues.contract_main_orgunit !== "");
    },
    urlEncode: (value) => (value ? "true" : "false"),
    urlDecode: (value) => value === "true",
  },
  {
    id: "under_orgunit",
    key: "contracts.underOrgunit",
    type: "ouSearch",
    column: 2,
    value: "",
    onFilter: (orgUnitId, contracts, contractsOverlaps) => {
      if (orgUnitId == undefined || orgUnitId == "") {
        return contracts;
      }
      return contracts.filter((c) => c.orgUnit.path.includes(orgUnitId));
    },
    urlEncode: (value) => (value ? value : undefined),
    urlDecode: (value) =>  value,
  },
];

const filterConfig = (contractFields) => {
  if (contractFields === undefined) {
    return [];
  }
  const config = [...defaultFilters];
  if (contractFields.length === 0) {
    return config;
  }
  let lastIndex = 0;
  defaultFilters.forEach((f) => {
    if (f.column > lastIndex) {
      lastIndex = f.column + 2;
    }
  });
  getNonStandartContractFields(contractFields).forEach((field, index) => {
    lastIndex += index;
    if (lastIndex > columnsCount) {
      lastIndex -= columnsCount;
    }
    config.push({
      id: field.code,
      key: field.name,
      type: "select",
      multi: true,
      column: lastIndex,
      value: [],
      options: field.optionSet.options.map((o) => {
        return { label: o.name, value: o.code };
      }),

      onFilter: (groups, contracts) => {
        if (groups.length === 0) {
          return contracts;
        }

        return contracts.filter((c) => c.codes.some((c) => groups.findIndex((g) => g.value === c) >= 0));
      },
      // turn selected options [{label: ,value:}, {label: ,value:}] into string value1,value2,...
      urlEncode: (value) => (!value || value.length === 0 ? "" : value.map((c) => c.value).join(",")),
      // turn  value1,value2 in to array of option {label: ,value:} based on optionSet.options
      urlDecode: (value) => (!value || value === "" ? [] : value.split(",").map((v) => getOptionFromField(field, v))),
    });
  });
  return config;
};

export default filterConfig;
