import React, { useCallback, useState } from "react";
import _ from "lodash";

const useDebounce = (obj, wait = 1250) => {
  const [state, setState] = useState(obj);

  const setDebouncedState = (val) => {
    debounce(val);
  };

  const debounce = useCallback(
    _.debounce((prop) => {
      setState(prop);
    }, wait),
    [],
  );

  return [state, setDebouncedState];
};

export default useDebounce;
