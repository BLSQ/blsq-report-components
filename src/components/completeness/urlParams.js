export const onTableChange = (tableQueryParamPrefix) => {
  return (action, tableState) => {
    if (action === "propsUpdate") {
      const queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
      let index = 0;
      for (let column of tableState.columns) {
        const paramName = tableQueryParamPrefix + column.name;
        const value = queryParams.get(paramName);
        debugger;
        if (value == null) {
          tableState.filterList[index] = [];
        } else {
          tableState.filterList[index] = [value];
        }
        index = index + 1;
      }
    }

    if (action === "filterChange") {
      const queryParams = new URLSearchParams(window.location.hash.split("?")[1]);
      let index = 0;
      for (let column of tableState.columns) {
        const value = tableState.filterList[index];
        const paramName = tableQueryParamPrefix + column.name;
        if (value.length == 0) {
          queryParams.delete(paramName);
        } else if (value.length == 1) {
          queryParams.set(paramName, value);
        } else {
          queryParams.set(paramName, JSON.stringify(value));
        }
        index = index + 1;
      }

      const hash = window.location.hash.split("?")[0];
      const newUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        hash +
        "?" +
        queryParams.toString();

      window.history.replaceState({}, "", newUrl);
    }
  };
};
