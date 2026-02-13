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
  precision: any = 2,
  round: any = true,
  currency: any = "Rp",
) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") {
    value = value.split(delimiter).join("").split(decimal).join(".");
  }

  if (isNaN(value)) return "";

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
  precision: any = 2,
  round: any = true,
  currency: any = "Rp",
) {
  if (value === null || value === undefined) return 0;

  // Convert to string and remove currency + spaces
  let vStr = value.toString().replace(currency, "").trim();

  // Standard removeDelimiter logic
  return Number(vStr.split(delimiter).join("").split(decimal).join("."));
}
