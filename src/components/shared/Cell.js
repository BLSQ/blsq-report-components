import React from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  numberWithCommas,
  roundedAmount,
  roundedAmountOrInteger,
  roundedPercent,
  labelize
} from "../../support/NumberFormatter";

const styles = theme => ({
  cellOrder: {
    textAlign: "center",
    padding: "0px 3px 0px 3px",
    border: "0.5pt solid black"
  },
  cellText: {
    textAlign: "left",
    height: "21px",
    padding: "0px 3px 0px 3px",
    border: "0.5pt solid black"
  },
  cellLargeText: {
    textAlign: "left",
    height: "18px",
    padding: "5px 5px 5px 5px",
    border: "0.5pt solid black"
  },
  cellQuantity: {
    textAlign: "center",
    padding: "0px 3px 0px 3px",
    border: "0.5pt solid black"
  },
  cellAmount: {
    textAlign: "right",
    padding: "0px 3px 0px 3px",
    border: "0.5pt solid black"
  }
});

function resolve(path, obj, separator = ".") {
  if (path === "self") {
    return obj;
  }
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

const Cell = props => {
  const { classes, variant, field, value, bold, ...other } = props;
  const amount = resolve(field, value);
  let className = null;
  let label = labelize(amount);
  let displayedValue = amount;

  if (variant === undefined || variant === "quantity") {
    if (amount === undefined) {
      displayedValue = "";
    } else {
      displayedValue = amount.value;
    }
    className = classes.cellQuantity;
  } else if (variant === "money") {
    displayedValue = numberWithCommas(roundedAmount(amount.value));
    className = classes.cellAmount;
  } else if (variant === "rounded") {
    displayedValue = roundedAmount(amount.value);
    className = classes.cellQuantity;
  } else if (variant === "text") {
    label = "";
    displayedValue = amount;
    className = classes.cellText;
  } else if (variant === "largeText") {
    label = "";
    displayedValue = amount;
    className = classes.cellLargeText;
  } else if (variant === "textde") {
    if (amount !== undefined) {
      displayedValue = amount.value;
    }
    className = classes.cellText;
  } else if (variant === "order") {
    label = "";
    displayedValue = amount;
    className = classes.cellOrder;
  } else if (props.variant === "percentage") {
    displayedValue = roundedPercent(amount.value);
    className = classes.cellQuantity;
  } else if (props.variant === "roundedAmountOrInteger") {
    displayedValue = roundedAmountOrInteger(amount.value);
    className = classes.cellQuantity;
  } else {
    throw new Error("not supported variant : " + variant);
  }

  const boldValue = bold === true;
  return (
    <td className={className} title={label} {...other}>
      {boldValue && <b>{displayedValue}</b>}
      {!boldValue && <React.Fragment>{displayedValue}</React.Fragment>}
    </td>
  );
};

export default withStyles(styles)(Cell);
