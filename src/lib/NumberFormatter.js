export function roundedAmount(number) {
  if (number === " " || number === undefined) {
    return "";
  }
  if (typeof number === "string" || number instanceof String) {
    return number;
  }

  return number.toFixed(2);
}

export function roundedPercent(number) {
  if (number === " " || number === undefined) {
    return "";
  }

  return number.toFixed(2);
}

export function roundedAmountOrInteger(number) {
  if (number === " " || number === undefined) {
    return "";
  }
  if (Number.isInteger(number)) {
    return number;
  }
  if (number) {
    return number.toFixed(2);
  }
  return "";
}

export function numberWithCommas(x) {
  if (x === undefined) {
    return "";
  }
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function labelize(descriptor) {
  if (descriptor === undefined) {
    return "";
  }
  return (
    descriptor.name +
    " (" +
    descriptor.code +
    ")  " +
    descriptor.period +
    " " +
    descriptor.value
  );
}
