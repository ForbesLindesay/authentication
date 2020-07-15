export function getNameMap<T extends number>(enumObj: {
  [key: string]: string | T;
}) {
  return new Map(
    Object.entries(enumObj)
      .filter((entry): entry is [string, T] => typeof entry[1] === 'number')
      .map(([str, alg]) => [alg, str]),
  );
}
