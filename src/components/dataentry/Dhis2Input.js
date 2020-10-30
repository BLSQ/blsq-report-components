import React, { useEffect, useState, useContext } from "react";
import { TextField, Tooltip } from "@material-ui/core";
import FormDataContext from "./FormDataContext";

const Dhis2Input = (props) => {
  const formDataContext = useContext(FormDataContext);
  const [rawValue, setRawValue] = useState("");
  const [dataValue, setDataValue] = useState("");

  useEffect(() => {
    const dataValue = formDataContext ? formDataContext.getValue(props.dataElement) : undefined;
    setDataValue(dataValue);
    const defaultRawValue = dataValue !== undefined ? dataValue.value : "";
    setRawValue(defaultRawValue);
  }, [formDataContext]);

  if (formDataContext == undefined) {
    return <></>;
  }
  const onChange = (e) => {
    setRawValue(e.target.value);
  };
  return (
    <div>
      <Tooltip title={JSON.stringify(dataValue, undefined, 2) + " " + props.dataElement}>
        <TextField type="text" value={rawValue} onChange={onChange}></TextField>
      </Tooltip>
    </div>
  );
};

export default Dhis2Input;
