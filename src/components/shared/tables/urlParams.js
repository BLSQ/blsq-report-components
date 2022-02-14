export const anchorQueryParams = () => new URLSearchParams(window.location.hash.split("?")[1]);

export const urlWith = (queryParams) => {
  const hash = window.location.hash.split("?")[0];
  const newUrl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    hash +
    "?" +
    queryParams.toString();
  return newUrl;
};

export const onTableChange = (tableQueryParamPrefix, rows) => {
  return (action, tableState) => {
    if (action === "propsUpdate") {
      const queryParams = anchorQueryParams();
      let index = 0;
      for (let column of tableState.columns) {
        const paramName = tableQueryParamPrefix + column.name;
        let value = queryParams.get(paramName);
        if (column.filterType == "multiselect") {
          try {
            tableState.filterList[index] = value.split(',');
          } catch (ignored) {}
        } else if (value == null) {
          tableState.filterList[index] = [];
        } else {
          tableState.filterList[index] = [value];
        }
        index = index + 1;
      }
      const searchParamsName = tableQueryParamPrefix + "searchText";
      const searchValue = queryParams.get(searchParamsName);
      tableState.searchText = searchValue;
    }

    if (action === "filterChange" || action === "search") {
      const queryParams = anchorQueryParams();
      let index = 0;
      for (let column of tableState.columns) {
        const value = tableState.filterList[index];
        const paramName = tableQueryParamPrefix + column.name;
        if (value.length == 0) {
          queryParams.delete(paramName);
        } else if (value.length == 1) {
          queryParams.set(paramName, value);
        } else if (column.filterType == "multiselect") {
          queryParams.set(paramName, value.join(","));
        } else {
          queryParams.set(paramName, JSON.stringify(value));
        }
        index = index + 1;
      }

      const searchParamsName = tableQueryParamPrefix + "searchText";

      if (tableState.searchText == "" || tableState.searchText == undefined) {
        queryParams.delete(searchParamsName);
      } else {
        queryParams.set(searchParamsName, tableState.searchText);
      }

      window.history.replaceState({}, "", urlWith(queryParams));
    }
  };
};
