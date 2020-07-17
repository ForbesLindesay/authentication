enum HashFunction {
  sha512 = 512,
}
const SALT_LENGTH = 16;
const KEY_LENGTH = 512;
const HASH_FUNCTION = HashFunction.sha512;

const hashNames = new Map(
  Object.entries(HashFunction)
    .filter(
      <A, B>(v: [A, B]): v is [A, Extract<B, number>] =>
        typeof v[1] === 'number',
    )
    .map(([name, value]) => [value, name]),
);

export function hashFunctionToString(hashFunction: HashFunction) {
  const result = hashNames.get(hashFunction);
  if (!result) {
    throw new Error('Unsupported hash function');
  }
  return result;
}

export default interface Configuration {
  iterations: number;
  saltLength: number;
  keyLength: number;
  hashFunction: HashFunction;
}

export function getDefaultConfig(iterations: number) {
  return {
    iterations,
    saltLength: SALT_LENGTH,
    keyLength: KEY_LENGTH,
    hashFunction: HASH_FUNCTION,
  };
}

export const CONFIG_BYTE_LENGTH = 16;
export function configToBuffer(
  configuration: Configuration,
  configDataOut: Uint32Array,
) {
  configDataOut[0] = configuration.iterations;
  configDataOut[1] = configuration.saltLength;
  configDataOut[2] = configuration.keyLength;
  configDataOut[3] = configuration.hashFunction;
}

export function configFromBuffer(configData: Uint32Array): Configuration {
  const [iterations, saltLength, keyLength, hashFunction] = configData;
  return {iterations, saltLength, keyLength, hashFunction};
}

export function configEquals(a: Configuration, b: Configuration): boolean {
  return (
    a.iterations === b.iterations &&
    a.saltLength === b.saltLength &&
    a.keyLength === b.keyLength &&
    a.hashFunction === b.hashFunction
  );
}
