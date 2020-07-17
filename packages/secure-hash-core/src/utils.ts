export function getNameMap<T extends number>(enumObj: {
  [key: string]: string | T;
}) {
  return new Map(
    Object.entries(enumObj)
      .filter((entry): entry is [string, T] => typeof entry[1] === 'number')
      .map(([str, alg]) => [alg, str]),
  );
}

export function isValueInSet<TValue, TSetValue extends TValue>(
  set: Set<TSetValue>,
  value: TValue,
): value is TSetValue {
  return set.has(value as TSetValue);
}
