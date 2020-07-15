import {cpus} from 'os';
import ms = require('ms');
import throat = require('throat');
import SecureHashImplementation, {
  Algorithm,
  getAlgorithmName,
  SecureHashOptions,
  Options,
} from './implementations/SecureHashImplementation';
import fallbacks from './fallbacks';

const MINIMUM_MINIMUM_HASH_TIME = ms('200ms');
const DEFAULT_MINIMUM_HASH_TIME = ms('400ms');
const MAXIMUM_MINIMUM_HASH_TIME = ms('2 minutes');

const MINIMUM_HASH_TIME = process.env.MINIMUM_HASH_TIME;
const HASH_PARALLEL_LIMIT = process.env.HASH_PARALLEL_LIMIT;

function validateImplementation(
  implementation: SecureHashImplementation<Algorithm>,
) {
  if (!implementation || typeof implementation !== 'object') {
    throw new Error(`implementation must be an object`);
  }
  const name = getAlgorithmName(implementation.algorithm);
  if (!name) {
    throw new Error(`implementation does not have a valid algorithm ID`);
  }
  if (typeof implementation.increaseWorkFactor !== 'function') {
    throw new Error(`${name} should have an increaseWorkFactor function`);
  }
  if (typeof implementation.hash !== 'function') {
    throw new Error(`${name} should have a hash function`);
  }
  if (typeof implementation.verify !== 'function') {
    throw new Error(`${name} should have a verify function`);
  }
  return implementation;
}

function validateMinimumHashTime(minimumHashTime: number | string) {
  if (typeof minimumHashTime === 'string') {
    minimumHashTime = ms(minimumHashTime);
  }
  if (
    typeof minimumHashTime !== 'number' ||
    minimumHashTime < MINIMUM_MINIMUM_HASH_TIME ||
    minimumHashTime > MAXIMUM_MINIMUM_HASH_TIME ||
    Number.isNaN(minimumHashTime) ||
    minimumHashTime !== (minimumHashTime | 0)
  ) {
    throw new Error(
      'Invalid MINIMUM_HASH_TIME, expected an integer number of milliseconds greater than ' +
        ms(MINIMUM_MINIMUM_HASH_TIME, {long: true}) +
        ' and less than ' +
        ms(MAXIMUM_MINIMUM_HASH_TIME, {long: true}),
    );
  }
  return minimumHashTime;
}

function validateParallelLimit(parallelLimit: number) {
  if (
    parallelLimit < 1 ||
    Number.isNaN(parallelLimit) ||
    typeof parallelLimit !== 'number' ||
    parallelLimit !== Math.round(parallelLimit) ||
    parallelLimit >= Number.MAX_SAFE_INTEGER
  ) {
    throw new Error(
      'Invalid HASH_PARALLEL_LIMIT, expected an integer greater than or equal to 1.',
    );
  }
  return throat(parallelLimit);
}

export default class SecureHashAPI {
  private _defaultImplementation: SecureHashImplementation<Algorithm>;
  private _minimumHashTime: number;
  private _throttle: <TResult>(fn: () => Promise<TResult>) => Promise<TResult>;
  constructor(
    implementation: SecureHashImplementation<Algorithm>,
    options: SecureHashOptions = {},
  ) {
    this._defaultImplementation = validateImplementation(implementation);

    this._throttle = validateParallelLimit(
      options.parallelLimit !== undefined
        ? options.parallelLimit
        : HASH_PARALLEL_LIMIT
          ? parseInt(HASH_PARALLEL_LIMIT, 10)
          : Math.max(cpus().length - 1, 3),
    );

    this._minimumHashTime = validateMinimumHashTime(
      options.minimumHashTime === undefined
        ? MINIMUM_HASH_TIME || DEFAULT_MINIMUM_HASH_TIME
        : options.minimumHashTime,
    );
  }

  setDefaultImplementation<TAlgorithm extends Algorithm>(
    implementation: SecureHashImplementation<TAlgorithm>,
    options?: Options[TAlgorithm],
  ) {
    this._defaultImplementation = validateImplementation(implementation);
    if (options !== undefined) implementation.setOptions(options);
  }

  setMinimumHashTime(minimumHashTime: number | string) {
    const value =
      typeof minimumHashTime === 'number'
        ? minimumHashTime
        : ms(minimumHashTime);
    this._minimumHashTime = validateMinimumHashTime(value);
  }
  setParallelLimit(parallelLimit: number) {
    this._throttle = validateParallelLimit(parallelLimit);
  }

  private async _hashBuffer(passwordBuffer: Buffer): Promise<string> {
    while (true) {
      const start = Date.now();
      const hash = await this._defaultImplementation.hash(passwordBuffer);
      const end = Date.now();
      const duration = end - start;
      if (duration >= this._minimumHashTime) {
        const algorithmID = this._defaultImplementation.algorithm.toString(10);
        return `${algorithmID}:${hash.toString('base64')}`;
      }

      // attempt to increase hash time by the right factor
      const factor = this._minimumHashTime / duration;
      this._defaultImplementation.increaseWorkFactor(factor);
    }
  }
  private async _hash(password: string): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new TypeError('password should be a, non-empty, string');
    }
    const passwordBuffer = Buffer.from(password);
    return await this._hashBuffer(passwordBuffer);
  }
  private async _verify(
    password: string,
    passwordHash: string,
    onUpdate: (passwordHash: string) => Promise<unknown>,
  ): Promise<boolean> {
    if (!password || typeof password !== 'string') {
      throw new TypeError('password should be a string');
    }
    if (!passwordHash || typeof passwordHash !== 'string') {
      throw new TypeError('passwordHash should be a string');
    }
    if (typeof onUpdate !== 'function') {
      throw new TypeError('onUpdate should be a function');
    }

    const algorithmIDMatch = /^(\d+)\:/.exec(passwordHash);
    const algorithmID = algorithmIDMatch
      ? parseInt(algorithmIDMatch[1], 10)
      : // Argon2id was used before we began tagging entries with an algorithm prefix
        Algorithm.Argon2id;
    const implementation =
      this._defaultImplementation.algorithm === algorithmID
        ? this._defaultImplementation
        : fallbacks.find(a => a.algorithm === algorithmID);

    if (!implementation) {
      const algorithmName = getAlgorithmName(algorithmID);
      const msg = algorithmName
        ? `This password was hashed using ${algorithmName} which is not loaded. You need to add "import '@authentication/secure-hash/${algorithmName}';" to verify this password.`
        : `This password was not hashed using any of the algorithms currently supported by secure-hash (id: ${algorithmID})`;
      throw new Error(msg);
    }

    const passwordBuffer = Buffer.from(password);
    const passwordHashBuffer = Buffer.from(
      algorithmIDMatch
        ? passwordHash.substr(algorithmIDMatch[0].length)
        : passwordHash,
      'base64',
    );

    const start = Date.now();
    const {valid, outdated} = await implementation.verify(
      passwordBuffer,
      passwordHashBuffer,
    );
    const end = Date.now();
    if (valid === true) {
      if (
        outdated ||
        end - start < this._minimumHashTime ||
        this._defaultImplementation !== implementation
      ) {
        await onUpdate(await this._hashBuffer(passwordBuffer));
      }
      return true;
    } else {
      return false;
    }
  }

  hash(password: string): Promise<string> {
    return this._throttle(() => this._hash(password));
  }

  verify(
    password: string,
    passwordHash: string,
    onUpdate: (passwordHash: string) => Promise<unknown>,
  ): Promise<boolean> {
    return this._throttle(() => this._verify(password, passwordHash, onUpdate));
  }
}
