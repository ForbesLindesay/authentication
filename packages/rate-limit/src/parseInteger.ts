export default function parseInteger(
  value: void | number,
  defaultValue: number,
  name: string,
  min: number = -Infinity,
  max: number = Infinity,
): number {
  const v = typeof value === 'undefined' ? defaultValue : value;
  if (typeof v !== 'number' || isNaN(v) || (v | 0) !== v) {
    throw new Error(name + ' is not a valid integer.');
  }
  if (v < min) {
    throw new Error(name + ' should not be less than ' + min);
  }
  if (v > max) {
    throw new Error(name + ' should not be greater than ' + max);
  }
  return v;
}
