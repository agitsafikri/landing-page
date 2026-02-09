export function setDelimiter(value: any, delimiter: any = '.') {
  if (isNaN(value) || value === null) return '';

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
}
export function removeDelimiter(
  value: any,
  delimiter: any = '.',
  decimal: any = ','
) {
  if (isNaN(value) || value === null) return '';

  value = value.toString().replace(delimiter, '');
  return Number(value.replace(decimal, '.'));
}

export function setMoneyDelimiter(
  value: any,
  delimiter: any = '.',
  decimal: any = ',',
  precision: any = 2,
  round: any = true,
  currency: any = 'Rp'
) {
  if (isNaN(value) || value === null) return '';
  let v = value.toFixed(precision);
  if (round) v = Math.round(v * 100) / 100;
  return (
    currency +
    ' ' +
    v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter) +
    decimal +
    v.toString().slice(-precision)
  );
}
export function removeMoneyDelimiter(
  value: any,
  delimiter: any = '.',
  decimal: any = ',',
  precision: any = 2,
  round: any = true,
  currency: any = 'Rp'
) {
  let v = value.toFixed(precision);
  if (round) v = Math.round(v * 100) / 100;
  return (
    currency +
    ' ' +
    v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter) +
    decimal +
    v.slice(-precision)
  );
}
