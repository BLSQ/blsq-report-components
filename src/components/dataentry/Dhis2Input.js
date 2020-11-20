import React, { useEffect, useState, useContext } from "react";
import { TextField, Tooltip } from "@material-ui/core";
import FormDataContext from "./FormDataContext";
import useDebounce from "./useDebounce";

const Dhis2Input = ({ dataElement }) => {
  const formDataContext = useContext(FormDataContext);
  const [rawValue, setRawValue] = useState("");
  const [dataValue, setDataValue] = useState("");

  const [debouncedState, setDebouncedState] = useDebounce(undefined);

  useEffect(() => {
    const dataValue = formDataContext && formDataContext.getValue ? formDataContext.getValue(dataElement) : undefined;
    setDataValue(dataValue);
    const defaultRawValue = dataValue !== undefined ? dataValue.value : "";
    setRawValue(defaultRawValue);
  }, [formDataContext]);

  useEffect(() => {
    if (formDataContext && debouncedState !== undefined && formDataContext.updateValue) {
      formDataContext.updateValue(dataElement, debouncedState);
    }
  }, [debouncedState]);

  if (formDataContext == undefined) {
    return <></>;
  }
  const isComplete = formDataContext.isDataSetComplete();

  const onChange = (e) => {
    setRawValue(e.target.value);
    setDebouncedState(e.target.value);
  };

  return (
    <div>
      <Tooltip
        disableFocusListener
        disableTouchListener
        arrow
        title={
          <div>
            <pre>{JSON.stringify(dataValue, undefined, 2) + " " + dataElement}</pre>
          </div>
        }
      >
        <TextField
          error={formDataContext.isInvalid(dataElement)}
          type="text"
          disabled={isComplete}
          value={rawValue}
          onChange={onChange}
          inputProps={{
            style: {
              textAlign: "right",
              backgroundColor: formDataContext && formDataContext.isModified(dataElement) ? "#badbad" : "",
            },
          }}
          helperText={formDataContext && formDataContext.error(dataElement)}
        />
      </Tooltip>
    </div>
  );
};

export default Dhis2Input;
