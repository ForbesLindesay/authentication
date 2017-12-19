import ms = require('ms');

export default function parseMs(
  value: void | number | string,
  defaultValue: number,
  name: string,
): number {
  const v =
    typeof value === 'undefined'
      ? defaultValue
      : typeof value === 'number'
        ? value
        : typeof value === 'string' ? ms(value) : value;
  if (typeof v !== 'number' || isNaN(v)) {
    throw new Error(name + ' is not a valid number of milliseconds.');
  }
  return v;
}
