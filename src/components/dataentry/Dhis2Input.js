import React, { useEffect, useState, useContext } from "react";
import { withTranslation } from "react-i18next";
import {
  TextField,
  Tooltip,
  ClickAwayListener,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import FormDataContext from "./FormDataContext";
import useDebounce from "../shared/useDebounce";

const Dhis2Input = ({ element, dataElement, t }) => {
  const formDataContext = useContext(FormDataContext);
  const [rawValue, setRawValue] = useState("");
  const [dataValue, setDataValue] = useState("");

  const [debouncedState, setDebouncedState] = useDebounce(undefined);
  const [open, setOpen] = useState(false);

  const WrapperElement = element || "div";
  const dataElementId = dataElement && dataElement.split(".")[0];
  const dataElementDescriptor = formDataContext.dataElementsById[dataElementId];
  const isBoolean = dataElementDescriptor && dataElementDescriptor.valueType == "BOOLEAN";

  useEffect(() => {
    const value = formDataContext && formDataContext.getValue && formDataContext.getValue(dataElement);
    const dataValue = value !== undefined ? value : { dataElement: dataElement, value: "" };
    setDataValue(dataValue);
    const defaultRawValue = dataValue !== undefined ? dataValue.value : "";
    setRawValue(defaultRawValue);
  }, []); // TODO ask christophe technically depends on formDataContext but only for the initial load of data, afterwards the rawValue is the "master" to display

  useEffect(() => {
    if (formDataContext && debouncedState !== undefined && formDataContext.updateValue) {
      formDataContext.updateValue(dataElement, debouncedState);
    }
  }, [debouncedState]);

  if (formDataContext == undefined) {
    return <></>;
  }
  const isComplete = formDataContext.isDataSetComplete();
  const isDataWritable = formDataContext.isDataWritable();

  const onChange = (e) => {
    setRawValue(e.target.value);
    setDebouncedState(e.target.value);
  };

  const onBooleanChange = (e) => {
    setRawValue(e.target.value);
    setDebouncedState(e.target.value);
  }

  const handleOpenToolTip = () => {
    setOpen(true);
  };
  const handleCloseToolTip = () => {
    setOpen(false);
  };


  const widget = isBoolean ? (
    <FormControl
      style={{
        backgroundColor:
          formDataContext && formDataContext.isModified(dataElement)
            ? "#badbad"
            : formDataContext.isUpdating(dataElement)
            ? "orange"
            : "",
      }}
    >
      <RadioGroup row value={rawValue} onChange={onBooleanChange} disabled={isComplete || !isDataWritable}>
        <FormControlLabel value="true" control={<Radio />} label={t("dataEntry.valueType.BOOLEAN.true")} />
        <FormControlLabel value="false" control={<Radio />} label={t("dataEntry.valueType.BOOLEAN.false")} />
        <FormControlLabel value="" control={<Radio />} label={t("dataEntry.valueType.BOOLEAN.undefined")} />
      </RadioGroup>
    </FormControl>
  ) : (
    <TextField
      error={formDataContext.isInvalid(dataElement)}
      type="text"
      disabled={isComplete || !isDataWritable}
      value={rawValue}
      onChange={onChange}
      onDoubleClick={handleOpenToolTip}
      onClick={handleCloseToolTip}
      inputProps={{
        style: {
          textAlign: "right",
          backgroundColor:
            formDataContext && formDataContext.isModified(dataElement)
              ? "#badbad"
              : formDataContext.isUpdating(dataElement)
              ? "orange"
              : "",
        },
      }}
      helperText={formDataContext && formDataContext.error(dataElement)}
    />
  );

  return (
    <WrapperElement>
      <ClickAwayListener onClickAway={handleCloseToolTip}>
        <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          arrow
          open={open}
          onClose={handleCloseToolTip}
          title={
            <div>
              <pre>{JSON.stringify({ dataValue, isComplete, isDataWritable }, undefined, 2)}</pre>
            </div>
          }
        >
          {widget}
        </Tooltip>
      </ClickAwayListener>
    </WrapperElement>
  );
};

export default withTranslation()(Dhis2Input);
