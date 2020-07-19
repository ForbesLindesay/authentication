import {JsonObject} from './JsonValue';

export default function validator() {
  function validatorRecurse<T extends JsonObject, S extends JsonObject>(
    fn: (value: T) => {valid: true; value: S} | {valid: false; reason: string},
  ) {
    function chain<U extends JsonObject>(
      next: (
        value: S,
      ) => {valid: true; value: U} | {valid: false; reason: string},
    ) {
      return validatorRecurse<T, U>((value) => {
        const nextValue = fn(value);
        if (!nextValue.valid) return nextValue;
        return next(nextValue.value);
      });
    }
    return Object.assign(fn, {
      string<TKey extends string>(key: TKey) {
        return chain<S & Record<TKey, undefined | string>>((value) => {
          if (value[key] !== undefined && typeof value[key] !== 'string') {
            return {
              valid: false,
              reason: `If ${key} is present, it must be a string`,
            };
          }
          return {valid: true, value: value as any};
        });
      },
      number<TKey extends string>(key: TKey) {
        return chain<S & Record<TKey, undefined | number>>((value) => {
          if (value[key] !== undefined && typeof value[key] !== 'number') {
            return {
              valid: false,
              reason: `If ${key} is present, it must be a number`,
            };
          }
          return {valid: true, value: value as any};
        });
      },
    });
  }
  return validatorRecurse<JsonObject, JsonObject>((v) => ({
    valid: true,
    value: v,
  }));
}
