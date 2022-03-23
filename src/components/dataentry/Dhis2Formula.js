import React, { useEffect, useState, useContext } from "react";
import { TextField, Tooltip, ClickAwayListener } from "@material-ui/core";
import FormDataContext from "./FormDataContext";

import {safeDiv, iff, abs,roundFunction, parseDependencies} from "./dhis2FormulaParsing"

const Dhis2Formula = ({ formula }) => {
  const formDataContext = useContext(FormDataContext);
  const [rawValue, setRawValue] = useState("");
  const [expression, setExpression] = useState("");
  const [error, setError] = useState(undefined);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (formDataContext && formula) {
      const dependencies = parseDependencies(formula);
      let expression = formula;
      dependencies.forEach((dep) => {
        const val = formDataContext.getValue(dep);
        let valExpression = val !== undefined ? val.value : 0;
        if (valExpression === "" || valExpression === " " || valExpression === null) {
          valExpression = 0
        }
        expression = expression.split("#{" + dep + "}").join(" " + valExpression + " ");
      });

      setExpression(expression);
      try {
        const evaluatedExpression = new Function(
          "SAFE_DIV",
          "IFF",
          "ABS",
          "ROUND",
          "return " + expression.replace("IF(", "IFF("),
        )(safeDiv, iff, abs, roundFunction);

        setRawValue("" + evaluatedExpression);
      } catch (error) {
        console.log(error, dependencies, expression, formula);
        setError(error.message + " " + dependencies + " " + expression);
      }
    }
  }, [formDataContext, formula, setRawValue]);

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
    <span>
      <ClickAwayListener onClickAway={handleCloseToolTip}>
        <Tooltip
          title={
            <div>
              {formula} <br />
              <br />
              {expression} <br />
              <br />
              {rawValue}
              <br />
              ERROR ? {error}
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
              tabIndex: -1,
              style: {
                textAlign: "right",
                backgroundColor: error ? "red" : "lightgrey",
              },
            }}
            error={error}
            onDoubleClick={handleOpenToolTip}
            onClick={handleCloseToolTip}
          />
        </Tooltip>
      </ClickAwayListener>
    </span>
  );
};

export default Dhis2Formula;
