import React, { useEffect, useState, useContext } from "react";
import { TextField, Tooltip, ClickAwayListener } from "@material-ui/core";
import FormDataContext from "./FormDataContext";

const parseDependencies = (expression) => {
  const components = expression
    .split("+")
    .flatMap((s) => s.split(","))
    .flatMap((s) => s.split("-"))
    .flatMap((s) => s.split("*"))
    .flatMap((s) => s.split("ROUND("))
    .flatMap((s) => s.split("IF("))
    .flatMap((s) => s.split("SAFE_DIV("))
    .flatMap((s) => s.split("ABS("))
    .flatMap((s) => s.split("("))
    .flatMap((s) => s.split(")"))
    .map((s) => s.trim());
  const deReferences = components.filter((s) => s.includes("#{"));
  const deps = deReferences.map((de) => de.replace("#{", "").replace("}", ""));
  return Array.from(new Set(deps));
};

const safeDiv = (a, b) => {
  if (b !== 0) {
    return a / b;
  }
  return 0;
};

const abs = (a) => {
  return Math.abs(a);
};

const iff = (a, b, c) => {
  return a ? b : c;
};
const roundFunction = (a, position) => {
  return a.toFixed(position);
};

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
        const valExpression = val !== undefined ? val.value : 0;
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
    <div>
      <ClickAwayListener onClickAway={handleCloseToolTip}>
        <Tooltip
          title={
            <div>
              {formula} <br />
              <br />
              {expression} <br />
              <br />
              {rawValue}
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

export default Dhis2Formula;
