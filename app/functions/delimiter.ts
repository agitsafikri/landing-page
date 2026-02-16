export function setDelimiter(value: any, delimiter: any = ".") {
  if (isNaN(value) || value === null) return "";

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
}
export function removeDelimiter(
  value: any,
  delimiter: any = ".",
  decimal: any = ",",
) {
  if (isNaN(value) || value === null) return "";

  value = value.toString().replace(delimiter, "");
  return Number(value.replace(decimal, "."));
}

export function setMoneyDelimiter(
  value: any,
  delimiter: any = ".",
  decimal: any = ",",
  precision: any = 0,
  round: any = true,
  currency: any = "Rp",
) {
  if (isNaN(value) || value === null) return "";
  let v = Number(value);
  if (round) {
    const factor = Math.pow(10, precision);
    v = Math.round(v * factor) / factor;
  }
  const parts = v.toFixed(precision).split(".");
  return (
    currency +
    " " +
    parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, delimiter) +
    (parts[1] ? decimal + parts[1] : "")
  );
}
export function removeMoneyDelimiter(
  value: any,
  delimiter: any = ".",
  decimal: any = ",",
  precision: any = 0,
  round: any = true,
  currency: any = "Rp",
) {
  if (isNaN(value) || value === null) return "";
  let v = Number(value);
  if (round) {
    const factor = Math.pow(10, precision);
    v = Math.round(v * factor) / factor;
  }
  const parts = v.toFixed(precision).split(".");
  return (
    currency +
    " " +
    parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, delimiter) +
    (parts[1] ? decimal + parts[1] : "")
  );
}
