import AlgorithmID from './AlgorithmID';
import {isValueInSet} from './utils';
import bytes = require('bytes');

const parameterParsers = {
  parallelLimit: integerParameter({
    envVar: 'HASH_PARALLEL_LIMIT',
    defaultValue: 4,
    minValue: 1,
    maxValue: 1024,
  }),

  opsLimit: integerParameter({
    envVar: 'HASH_OPS_LIMIT',
    defaultValue: 20,
    minValue: 10,
  }),

  memLimit: integerParameter(
    {
      envVar: 'HASH_MEM_LIMIT',
      defaultValue: bytes('64MB'),
      minValue: bytes('64MB'),
    },
    value => bytes(value),
  ),

  iterations: integerParameter({
    envVar: 'HASH_ITERATIONS',
    defaultValue: 100_000,
    minValue: 10_000,
  }),
};

const parameterNames = {
  [AlgorithmID.Argon2id]: keys('parallelLimit', 'memLimit', 'opsLimit'),
  [AlgorithmID.Pbkdf2]: keys('parallelLimit', 'iterations'),
};

type AlgorithmOptions<
  TAlgorithmID extends AlgorithmID
> = OptionsMap[TAlgorithmID]['inputs'] &
  Partial<
    Record<
      Exclude<
        keyof typeof parameterParsers,
        keyof OptionsMap[TAlgorithmID]['inputs']
      >,
      undefined
    >
  >;
export default AlgorithmOptions;
export type ParsedAlgorithmOptions<
  TAlgorithmID extends AlgorithmID
> = OptionsMap[TAlgorithmID]['outputs'] &
  Partial<
    Record<
      Exclude<
        keyof typeof parameterParsers,
        keyof OptionsMap[TAlgorithmID]['outputs']
      >,
      undefined
    >
  >;

export function parseOptions<TAlgorithmID extends AlgorithmID>(
  algorithmID: TAlgorithmID,
  options?: AlgorithmOptions<TAlgorithmID>,
): ParsedAlgorithmOptions<TAlgorithmID> {
  if (options)
    if (!options || typeof options !== 'object') {
      throw new Error('Expected options to be an object');
    }
  const result: any = {};
  for (const key of Object.keys(options as any)) {
    if (!isValueInSet(parameterNames[algorithmID], key)) {
      throw new Error(`Unexpected option "${key}".`);
    }
  }
  for (const key of parameterNames[algorithmID]) {
    result[key] = parameterParsers[key](
      options ? (options as any)[key] : undefined,
      `opitons.${key}`,
    );
  }
  return result;
}

type OptionsMap = {
  [key in keyof typeof parameterNames]: (typeof parameterNames)[key] extends Set<
    keyof typeof parameterParsers & infer T
  >
    ? AlgorithmTypes<keyof typeof parameterParsers & T>
    : never
};

function keys<
  TKeys extends [
    keyof typeof parameterParsers,
    ...(keyof typeof parameterParsers)[]
  ]
>(...keys: TKeys): Set<TKeys[number]> {
  return new Set(keys);
}

type Inputs<TKeys extends keyof typeof parameterParsers> = {
  [key in TKeys]?: (typeof parameterParsers)[key] extends Parameter<
    infer TInput,
    any
  >
    ? TInput
    : never
};
type Outputs<TKeys extends keyof typeof parameterParsers> = {
  [key in TKeys]: (typeof parameterParsers)[key] extends Parameter<
    any,
    infer TOutput
  >
    ? TOutput
    : unknown
};
type AlgorithmTypes<TKeys extends keyof typeof parameterParsers> = {
  inputs: Inputs<TKeys>;
  outputs: Outputs<TKeys>;
};

interface IntegerParameter {
  envVar: string;
  defaultValue: number;
  minValue: number;
  maxValue?: number;
}
type Parameter<TInput, TOutput> = ((
  value: unknown,
  name: string,
) => TOutput) & {__brand__: TInput};

function integerParameter(options: IntegerParameter): Parameter<number, number>;
function integerParameter(
  options: IntegerParameter,
  parse: (value: string, name: string) => number,
): Parameter<string | number, number>;
function integerParameter(
  {
    envVar,
    minValue,
    maxValue = Math.pow(2, 32) - 1,
    defaultValue,
  }: IntegerParameter,
  parse?: (value: string, name: string) => number,
): Parameter<string | number | undefined, number> {
  const error = (name: string): never => {
    throw new Error(
      `Invalid ${name}, expected an integer between ${minValue.toString(
        10,
      )} and ${maxValue.toString(10)}.`,
    );
  };
  const parseValue = (
    value: unknown,
    optionName: string,
  ): {value: number; valueName: string} => {
    if (value !== undefined) {
      if (typeof value === 'string') {
        if (parse) {
          return {
            value: typeof value === 'string' ? parse(value, optionName) : value,
            valueName: optionName,
          };
        } else {
          return error(optionName);
        }
      } else if (typeof value !== 'number') {
        return error(optionName);
      } else {
        return {
          value,
          valueName: optionName,
        };
      }
    } else {
      const envValue = process.env[envVar];
      if (envValue !== undefined) {
        return {
          value: parse ? parse(envValue, envVar) : parseInt(envValue, 10),
          valueName: envVar,
        };
      }
      return {value: defaultValue, valueName: 'optionName (default value)'};
    }
  };
  const validate = (input: unknown, optionName: string) => {
    const {value, valueName: name} = parseValue(input, optionName);
    if (
      Number.isNaN(value) ||
      typeof value !== 'number' ||
      value !== Math.round(value) ||
      value < minValue ||
      value >= maxValue
    ) {
      throw new Error(
        `Invalid ${name}, expected an integer between ${minValue.toString(
          10,
        )} and ${maxValue.toString(10)}.`,
      );
    }
    return value;
  };
  validate(defaultValue, `${envVar} default`);
  return validate as Parameter<number | string | undefined, number>;
}
