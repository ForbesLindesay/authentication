import {pbkdf2, timingSafeEqual, randomFill} from 'crypto';
import SecureHashImplementation, {
  Algorithm,
  Pbkdf2Options,
} from './SecureHashImplementation';
import {getNameMap} from '../utils';

enum HashFunction {
  sha512 = 512,
}
const SALT_LENGTH = 16;
const KEY_LENGTH = 512;
const HASH_FUNCTION = HashFunction.sha512;

const HASH_ITERATIONS = process.env.HASH_ITERATIONS;
const ITERAITONS_MIN = 50_000;
export const ITERATIONS_DEFAULT = 100_000;

const hashNames = getNameMap(HashFunction);
function hashFunctionToString(hashFunction: HashFunction) {
  const result = hashNames.get(hashFunction);
  if (!result) {
    throw new Error('Unsupported hash function');
  }
  return result;
}

function validateIterations(iterations: number) {
  if (
    typeof iterations !== 'number' ||
    Number.isNaN(iterations) ||
    iterations < ITERAITONS_MIN ||
    iterations !== (iterations | 0)
  ) {
    throw new Error(
      'Invalid HASH_ITERATIONS, expected an integer greater than or equal to ' +
        ITERAITONS_MIN,
    );
  }
  return iterations;
}

interface Configuration {
  iterations: number;
  saltLength: number;
  keyLength: number;
  hashFunction: HashFunction;
}
const CONFIG_BYTE_LENGTH = 16;
function configToBuffer(
  configuration: Configuration,
  configDataOut: Uint32Array,
) {
  configDataOut[0] = configuration.iterations;
  configDataOut[1] = configuration.saltLength;
  configDataOut[2] = configuration.keyLength;
  configDataOut[3] = configuration.hashFunction;
}
function configFromBuffer(configData: Uint32Array): Configuration {
  const [iterations, saltLength, keyLength, hashFunction] = configData;
  return {iterations, saltLength, keyLength, hashFunction};
}
function configEquals(a: Configuration, b: Configuration): boolean {
  return (
    a.iterations === b.iterations &&
    a.saltLength === b.saltLength &&
    a.keyLength === b.keyLength &&
    a.hashFunction === b.hashFunction
  );
}
export default class Pbkdf2Implemenation
  implements SecureHashImplementation<Algorithm.Pbkdf2> {
  public readonly algorithm = Algorithm.Pbkdf2;
  private _config: Configuration;
  constructor(options: Pbkdf2Options = {}) {
    const iterations = validateIterations(
      options.iterations === undefined
        ? HASH_ITERATIONS
          ? parseInt(HASH_ITERATIONS, 10)
          : ITERATIONS_DEFAULT
        : options.iterations,
    );

    this._config = {
      iterations,
      saltLength: SALT_LENGTH,
      keyLength: KEY_LENGTH,
      hashFunction: HASH_FUNCTION,
    };
  }

  setOptions(options: Pbkdf2Options) {
    this._config = {
      iterations: validateIterations(
        options.iterations === undefined
          ? this._config.iterations
          : options.iterations,
      ),
      saltLength: SALT_LENGTH,
      keyLength: KEY_LENGTH,
      hashFunction: HASH_FUNCTION,
    };
  }

  public increaseWorkFactor(factor: number) {
    const newIterations = Math.floor(this._config.iterations * factor);
    this._config = {
      ...this._config,
      iterations: Math.max(newIterations, this._config.iterations + 1_000),
    };
  }

  private async _hash(
    password: Buffer,
    salt: Buffer,
    config: Configuration,
  ): Promise<Buffer> {
    return await new Promise<Buffer>((resolve, reject) => {
      pbkdf2(
        password,
        salt,
        config.iterations,
        config.keyLength,
        hashFunctionToString(config.hashFunction),
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey);
        },
      );
    });
  }

  public async hash(password: Buffer): Promise<Buffer> {
    const config = this._config;
    const result = Buffer.alloc(
      CONFIG_BYTE_LENGTH + config.saltLength + config.keyLength,
    );
    const salt = Buffer.from(
      result.buffer,
      result.byteOffset + CONFIG_BYTE_LENGTH,
      config.saltLength,
    );
    await new Promise((resolve, reject) => {
      randomFill(salt, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    const hash = await this._hash(password, salt, this._config);
    configToBuffer(
      config,
      new Uint32Array(result.buffer, result.byteOffset, CONFIG_BYTE_LENGTH),
    );
    result.set(hash, CONFIG_BYTE_LENGTH + salt.length);
    return result;
  }

  public async verify(password: Buffer, passwordHash: Buffer) {
    const config = configFromBuffer(
      new Uint32Array(
        passwordHash.buffer,
        passwordHash.byteOffset,
        CONFIG_BYTE_LENGTH,
      ),
    );
    const salt = passwordHash.slice(
      CONFIG_BYTE_LENGTH,
      CONFIG_BYTE_LENGTH + config.saltLength,
    );
    const expectedHash = passwordHash.slice(
      CONFIG_BYTE_LENGTH + config.saltLength,
    );
    const actualHash = await this._hash(password, salt, config);
    if (timingSafeEqual(actualHash, expectedHash) !== true) {
      return {valid: false, outdated: false};
    }
    return {valid: true, outdated: !configEquals(this._config, config)};
  }
}
