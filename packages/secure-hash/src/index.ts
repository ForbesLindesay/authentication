import bytes = require('bytes');
import ms = require('ms');
import throat = require('throat');
import SecurePassword, {
  SecurePasswordType,
  VerifyResult,
} from './secure-password';

const ONE_SECOND = ms('1 second');

const opslimitMin = Math.max(SecurePassword.OPSLIMIT_DEFAULT, 20);
const memlimitMin = Math.max(SecurePassword.MEMLIMIT_DEFAULT, bytes('50MB'));

if (
  Number.isNaN(opslimitMin) ||
  typeof opslimitMin !== 'number' ||
  opslimitMin !== (opslimitMin | 0)
) {
  throw new TypeError('Invalid opslimitMin');
}
if (
  Number.isNaN(memlimitMin) ||
  typeof memlimitMin !== 'number' ||
  memlimitMin !== (memlimitMin | 0)
) {
  throw new TypeError('Invalid memlimitMin');
}

const MINIMUM_HASH_TIME = process.env.MINIMUM_HASH_TIME;
const HASH_OPS_LIMIT = process.env.HASH_OPS_LIMIT;
const HASH_MEM_LIMIT = process.env.HASH_MEM_LIMIT;
const HASH_PARALLEL_LIMIT = process.env.HASH_PARALLEL_LIMIT;

export interface Options {
  opslimit?: number;
  memlimit?: number | string;
  minimumHashTime?: number | string;
  parallelLimit?: number;
}
export default class SecureHash {
  private _sp: SecurePasswordType;
  private _opslimit: number;
  private _memlimit: number;
  private _minimumHashTime: number;
  private _throttle: <TResult>(fn: () => Promise<TResult>) => Promise<TResult>;
  constructor(options: Options = {}) {
    const parallelLimit =
      options.parallelLimit !== undefined
        ? options.parallelLimit
        : HASH_PARALLEL_LIMIT ? parseInt(HASH_PARALLEL_LIMIT, 10) : 3;
    if (
      parallelLimit < 1 ||
      Number.isNaN(parallelLimit) ||
      typeof parallelLimit !== 'number' ||
      parallelLimit !== (parallelLimit | 0)
    ) {
      throw new Error(
        'Invalid HASH_PARALLEL_LIMIT, expected an integer greater than or equal to 1.',
      );
    }
    this._throttle = throat(parallelLimit);
    this._minimumHashTime =
      options.minimumHashTime === undefined
        ? MINIMUM_HASH_TIME ? ms(MINIMUM_HASH_TIME) : ONE_SECOND
        : typeof options.minimumHashTime === 'number'
          ? options.minimumHashTime
          : ms(options.minimumHashTime);
    if (
      this._minimumHashTime < 500 ||
      Number.isNaN(this._minimumHashTime) ||
      typeof this._minimumHashTime !== 'number' ||
      this._minimumHashTime !== (this._minimumHashTime | 0)
    ) {
      throw new Error(
        'Invalid MINIMUM_HASH_TIME, expected an integer number of milliseconds greater than or equal to ' +
          ms(500),
      );
    }
    const opslimit =
      options.opslimit === undefined
        ? HASH_OPS_LIMIT ? parseInt(HASH_OPS_LIMIT, 10) : opslimitMin
        : options.opslimit;
    const memlimit =
      options.memlimit === undefined
        ? HASH_MEM_LIMIT ? bytes(HASH_MEM_LIMIT) : memlimitMin
        : typeof options.memlimit === 'number'
          ? options.memlimit
          : bytes(options.memlimit);

    if (
      opslimit < opslimitMin ||
      Number.isNaN(opslimit) ||
      typeof opslimit !== 'number' ||
      opslimit !== (opslimit | 0)
    ) {
      throw new Error(
        'Invalid HASH_OPS_LIMIT, expected an integer greater than or equal to ' +
          opslimitMin,
      );
    }
    if (
      memlimit < memlimitMin ||
      Number.isNaN(memlimit) ||
      typeof memlimit !== 'number' ||
      memlimit !== (memlimit | 0)
    ) {
      throw new Error(
        'Invalid HASH_MEM_LIMIT, expected an integer number of bytes greater than or equal to ' +
          bytes(memlimitMin),
      );
    }
    this._opslimit = opslimit;
    this._memlimit = memlimit;
    this._sp = new SecurePassword({
      opslimit: this._opslimit,
      memlimit: this._memlimit,
    });
  }
  private _hashBuffer(password: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this._sp.hash(password, (err, hashBuffer) => {
        if (err) return reject(err);
        resolve(hashBuffer);
      });
    });
  }
  private _verifyBuffer(
    password: Buffer,
    passwordHash: Buffer,
  ): Promise<VerifyResult> {
    return new Promise((resolve, reject) => {
      this._sp.verify(password, passwordHash, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
  private async _hash(password: string): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new TypeError('password should be a, non-empty, string');
    }
    const passwordBuffer = new Buffer(password);
    while (true) {
      const start = Date.now();
      const hash = await this._hashBuffer(passwordBuffer);
      const end = Date.now();
      const duration = end - start;
      if (duration >= this._minimumHashTime) {
        return hash.toString('base64');
      }

      // attempt to increase hash time by the right factor
      const factor = this._minimumHashTime / duration;
      const factorPart = Math.sqrt(factor);
      const newMemLimit = Math.ceil(this._memlimit * factorPart);
      if (newMemLimit - this._memlimit < bytes('1MB')) {
        this._memlimit += bytes('1MB');
      } else {
        this._memlimit = newMemLimit;
      }
      const newOpsLimit = Math.ceil(this._opslimit * factorPart);
      if (newOpsLimit - this._opslimit < 1) {
        this._opslimit += 1;
      } else {
        this._opslimit = newOpsLimit;
      }

      this._sp = new SecurePassword({
        opslimit: this._opslimit,
        memlimit: this._memlimit,
      });
    }
  }
  private async _verify(
    password: string,
    passwordHash: string,
    onUpdate: (passwordHash: string) => Promise<{} | void | null>,
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
    const passwordBuffer = new Buffer(password);
    const start = Date.now();
    const result = await this._verifyBuffer(
      passwordBuffer,
      new Buffer(passwordHash, 'base64'),
    );
    const end = Date.now();
    switch (result) {
      case SecurePassword.INVALID_UNRECOGNIZED_HASH:
        throw new Error('Invalid/Unrecognized password hash');
      case SecurePassword.INVALID:
        return false;
      case SecurePassword.VALID_NEEDS_REHASH:
        const newPassword = await this._hash(password);
        await onUpdate(newPassword);
        return true;
      case SecurePassword.VALID:
        if (end - start < this._minimumHashTime) {
          const newPassword = await this._hash(password);
          await onUpdate(newPassword);
        }
        return true;
    }
    throw new Error('Invalid hash result type');
  }
  hash(password: string): Promise<string> {
    return this._throttle(() => this._hash(password));
  }
  verify(
    password: string,
    passwordHash: string,
    onUpdate: (passwordHash: string) => Promise<{} | void | null>,
  ): Promise<boolean> {
    return this._throttle(() => this._verify(password, passwordHash, onUpdate));
  }

  static readonly hash = hash;
  static readonly verify = verify;
}

const sh = new SecureHash();
export function hash(password: string): Promise<string> {
  return sh.hash(password);
}
export function verify(
  password: string,
  passwordHash: string,
  onUpdate: (passwordHash: string) => Promise<{} | void | null>,
): Promise<boolean> {
  return sh.verify(password, passwordHash, onUpdate);
}

module.exports = SecureHash;
module.exports.default = SecureHash;
