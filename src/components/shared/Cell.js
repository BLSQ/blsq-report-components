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

const VARIANT_MONEY = "money";
const VARIANT_QUANTITY = "quantity";
const VARIANT_ROUNDED = "rounded";

const VARIANT_TEXT = "text";
const VARIANT_LARGE_TEXT = "largeText";

const VARIANT_TEXTDE = "textde"
const VARIANT_ORDER = "order"
const VARIANT_PERCENTAGE = "percentage"
const VARIANT_ROUNDED_AMOUNT_OR_INTEGER = "roundedAmountOrInteger"
const VARIANTS = [
  VARIANT_MONEY,
  VARIANT_QUANTITY,
  VARIANT_ROUNDED,
  VARIANT_TEXT,
  VARIANT_LARGE_TEXT,
  VARIANT_TEXTDE,
  VARIANT_ORDER,
  VARIANT_PERCENTAGE,
  VARIANT_ROUNDED_AMOUNT_OR_INTEGER
];

function resolve(path, obj, separator = ".") {
  if (path === "self") {
    return obj;
  }
  var properties = Array.isArray(path) ? path : path.split(separator);
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

const Cell = props => {
  const { classes, variant, field, value, bold, decimals, ...other } = props;
  const amount = resolve(field, value);
  let className = null;
  let label = labelize(amount);
  let displayedValue = amount;
  let displayedDecimals = decimals || 2

  if (variant === undefined || variant === VARIANT_QUANTITY) {
    if (amount === undefined) {
      displayedValue = "";
    } else {
      displayedValue = amount.value;
    }
    className = classes.cellQuantity;
  } else if (variant === VARIANT_MONEY) {
    displayedValue = numberWithCommas(roundedAmount(amount.value, displayedDecimals));
    className = classes.cellAmount;
  } else if (variant === VARIANT_ROUNDED) {
    displayedValue = roundedAmount(amount.value, displayedDecimals);
    className = classes.cellQuantity;
  } else if (variant === VARIANT_TEXT) {
    label = "";
    displayedValue = amount;
    className = classes.cellText;
  } else if (variant === VARIANT_LARGE_TEXT) {
    label = "";
    displayedValue = amount;
    className = classes.cellLargeText;
  } else if (variant === VARIANT_TEXTDE) {
    if (amount !== undefined) {
      displayedValue = amount.value;
    }
    className = classes.cellText;
  } else if (variant === VARIANT_ORDER) {
    label = "";
    displayedValue = amount;
    className = classes.cellOrder;
  } else if (props.variant === VARIANT_PERCENTAGE) {
    displayedValue = roundedPercent(amount.value, displayedDecimals);
    className = classes.cellQuantity;
  } else if (props.variant === VARIANT_ROUNDED_AMOUNT_OR_INTEGER) {
    displayedValue = roundedAmountOrInteger(amount.value, displayedDecimals);
    className = classes.cellQuantity;
  } else {
    throw new Error(
      "not supported variant : " + variant + " vs " + VARIANTS.join(", ")
    );
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
