import React, { useEffect, useState, useContext } from "react";
import { TextField, Tooltip, ClickAwayListener } from "@material-ui/core";
import FormDataContext from "./FormDataContext";

const HesabuFormula = ({ hesabuPackage, formulaCode, period, orgUnit, activity }) => {
  const formDataContext = useContext(FormDataContext);
  const [rawValue, setRawValue] = useState("");
  const [expression, setExpression] = useState("");
  const [error, setError] = useState(undefined);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (formDataContext && formulaCode) {
      setExpression(expression);
      try {
        const val = formDataContext.getCalculatedValue(hesabuPackage, formulaCode, period, orgUnit, activity);
        setRawValue(""+val);
      } catch (error) {
        setError(error.message + " " + +" " + expression);
      }
    }
  }, [formDataContext, formulaCode, setRawValue]);

  if (formDataContext == undefined) {
    return <></>;
  }
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
          title={
            <div>
              {hesabuPackage.code}.{formulaCode} <br />
              {activity &&
                hesabuPackage.activity_formulas[formulaCode] &&
                hesabuPackage.activity_formulas[formulaCode].expression}
              {activity == undefined &&
                hesabuPackage.formulas[formulaCode] &&
                hesabuPackage.formulas[formulaCode].expression}
              <br />
              {period} <br />
              <br />
              {activity && activity.code + " " + activity.name}
            </div>
          }
          disableFocusListener
          disableHoverListener
          disableTouchListener
          arrow
          open={open}
          onClose={handleCloseToolTip}
        >
          <TextField
            type="text"
            value={rawValue || ""}
            inputProps={{
              style: {
                textAlign: "right",
                backgroundColor: "lightgrey",
              },
            }}
            error={error}
            helperText={error ? expression + " : " + error : undefined}
            onDoubleClick={handleOpenToolTip}
            onClick={handleCloseToolTip}
          />
        </Tooltip>
      </ClickAwayListener>
    </div>
  );
};

export default HesabuFormula;
