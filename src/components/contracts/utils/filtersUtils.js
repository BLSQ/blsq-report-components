import { isToday } from "./periodsUtils";
import moment from "moment";
import qs from "qs";

export const getFilterValueById = (filterId, filters) => {
  const filterIndex = getFilterIndexById(filterId, filters);
  let value;
  if (filterIndex && filters[filterIndex] && filters[filterIndex].value) {
    value = filters[filterIndex].value;
  }
  return value;
};

export const checkFilters = (filters) => {
  let newFilters = [...filters];

  const activeAtValue = getFilterValueById("active_at", newFilters);
  if (getFilterValueById("active_today", newFilters) === true) {
    newFilters = updateFilters(moment().format("MM/DD/YYYY"), "active_at", newFilters);
  }
  if (activeAtValue && isToday(activeAtValue)) {
    newFilters = updateFilters(true, "active_today", newFilters);
  }
  if (!activeAtValue || activeAtValue === "") {
    newFilters = updateFilters(false, "active_today", newFilters);
  }
  return newFilters;
};

export const getFilterIndexById = (filterId, filters) => filters.findIndex((f) => f.id === filterId);

export const updateFilters = (value, filterId, filters) => {
  const newFilters = [...filters];
  const filterIndex = filters.findIndex((f) => f.id === filterId);
  if (filterIndex || filterIndex === 0) {
    newFilters[filterIndex].value = value;
  }
  return newFilters;
};

export const filterItems = (filters, items, extra) => {
  let filteredItems = [...items];
  filters.forEach((filter) => {
    filteredItems = filter.onFilter(filter.value, filteredItems, extra);
  });
  return filteredItems;
};

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
    let queryValue = f.urlDecode ? f.urlDecode(filtersFromUrl[f.id]) : filtersFromUrl[f.id];
    newFilters[index] = {
      ...f,
      value: queryValue || f.value,
    };
  });
  return newFilters;
};
