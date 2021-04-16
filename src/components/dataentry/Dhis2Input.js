import React, { useEffect, useState, useContext } from "react";
import { TextField, Tooltip, ClickAwayListener } from "@material-ui/core";
import FormDataContext from "./FormDataContext";
import useDebounce from "./useDebounce";

const Dhis2Input = ({ dataElement }) => {
  const formDataContext = useContext(FormDataContext);
  const [rawValue, setRawValue] = useState("");
  const [dataValue, setDataValue] = useState("");

  const [debouncedState, setDebouncedState] = useDebounce(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const value = formDataContext && formDataContext.getValue && formDataContext.getValue(dataElement);
    const dataValue = value !== undefined ? value : { dataElement: dataElement, value: "" };
    setDataValue(dataValue);
    const defaultRawValue = dataValue !== undefined ? dataValue.value : "";
    setRawValue(defaultRawValue);
  }, []);

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

  const handleOpenToolTip = () => {
    setOpen(true);
  };
  const handleCloseToolTip = () => {
    setOpen(false);
  };

  return (
    <div>
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
              <pre>{JSON.stringify(dataValue, undefined, 2)}</pre>
            </div>
          }
        >
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
        </Tooltip>
      </ClickAwayListener>
    </div>
  );
};

export default Dhis2Input;
