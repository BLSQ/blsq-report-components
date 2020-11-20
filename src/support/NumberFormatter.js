const isUndefinedOrEmpty = number => {
  return number === "" || number === " " || number === undefined;
};

export function roundedAmount(number, decimals = 2) {
  if (isUndefinedOrEmpty(number)) {
    return "";
  }
  if (typeof number === "string" || number instanceof String) {
    return number;
  }

  return number.toFixed(decimals);
}

export function roundedPercent(number, decimals = 2) {
  if (isUndefinedOrEmpty(number)) {
    return "";
  }

  return number.toFixed(decimals);
}

export function roundedAmountOrInteger(number, decimals = 2) {
  if (isUndefinedOrEmpty(number)) {
    return "";
  }
  if (Number.isInteger(number)) {
    return number;
  }
  if (number) {
    return number.toFixed(decimals);
  }
  return "";
}

export function numberWithCommas(x, separator = ",", decimalSeparator = ".") {
  if (x === undefined) {
    return "";
  }
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return parts.join(decimalSeparator);
}

export function labelize(field, descriptor) {
  if (descriptor === undefined) {
    return "";
  }
  if (
    [
      descriptor.name,
      descriptor.code,
      descriptor.period,
      descriptor.value
    ].every(el => el === undefined)
  ) {
    return "";
  }

  return (
    (field === undefined ? "" : field) +
    " " +
    (descriptor.expression ? " := " + descriptor.expression : "") +
    "\n" +
    descriptor.value +
    "\n" +
    descriptor.name +
    "\n" +
    descriptor.code +
    " " +
    descriptor.period
  );
}
