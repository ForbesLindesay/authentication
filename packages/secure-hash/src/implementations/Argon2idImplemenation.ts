import bytes = require('bytes');
import SecurePassword, {
  SecurePasswordType,
  VerifyResult,
} from '../vendor/secure-password';
import SecureHashImplementation, {
  Algorithm,
  Argon2idOptions,
} from './SecureHashImplementation';

export const OPSLIMIT_MIN = Math.max(SecurePassword.OPSLIMIT_DEFAULT, 20);
export const MEMLIMIT_MIN = Math.max(
  SecurePassword.MEMLIMIT_DEFAULT,
  bytes('50MB'),
);

if (
  Number.isNaN(OPSLIMIT_MIN) ||
  typeof OPSLIMIT_MIN !== 'number' ||
  OPSLIMIT_MIN !== Math.round(OPSLIMIT_MIN) ||
  OPSLIMIT_MIN >= Number.MAX_SAFE_INTEGER
) {
  throw new TypeError('Invalid opslimitMin');
}
if (
  Number.isNaN(MEMLIMIT_MIN) ||
  typeof MEMLIMIT_MIN !== 'number' ||
  MEMLIMIT_MIN !== Math.round(MEMLIMIT_MIN) ||
  MEMLIMIT_MIN >= Number.MAX_SAFE_INTEGER
) {
  throw new TypeError('Invalid memlimitMin');
}

const HASH_OPS_LIMIT = process.env.HASH_OPS_LIMIT;
const HASH_MEM_LIMIT = process.env.HASH_MEM_LIMIT;

export default class Argon2idImplemenation
  implements SecureHashImplementation<Algorithm.Argon2id> {
  public readonly algorithm = Algorithm.Argon2id;
  private _sp: SecurePasswordType;
  private _opslimit: number;
  private _memlimit: number;
  constructor(options: Argon2idOptions = {}) {
    const opslimit =
      options.opslimit === undefined
        ? HASH_OPS_LIMIT
          ? parseInt(HASH_OPS_LIMIT, 10)
          : OPSLIMIT_MIN
        : options.opslimit;
    const memlimit =
      options.memlimit === undefined
        ? HASH_MEM_LIMIT
          ? bytes(HASH_MEM_LIMIT)
          : MEMLIMIT_MIN
        : typeof options.memlimit === 'number'
          ? options.memlimit
          : bytes(options.memlimit);

    if (
      opslimit < OPSLIMIT_MIN ||
      Number.isNaN(opslimit) ||
      typeof opslimit !== 'number' ||
      opslimit !== Math.round(opslimit) ||
      opslimit >= Number.MAX_SAFE_INTEGER
    ) {
      throw new Error(
        'Invalid HASH_OPS_LIMIT, expected an integer greater than or equal to ' +
          OPSLIMIT_MIN,
      );
    }
    if (
      memlimit < MEMLIMIT_MIN ||
      Number.isNaN(memlimit) ||
      typeof memlimit !== 'number' ||
      memlimit !== Math.round(memlimit) ||
      memlimit >= Number.MAX_SAFE_INTEGER
    ) {
      throw new Error(
        'Invalid HASH_MEM_LIMIT, expected an integer number of bytes greater than or equal to ' +
          bytes(MEMLIMIT_MIN),
      );
    }
    this._opslimit = opslimit;
    this._memlimit = memlimit;
    this._sp = new SecurePassword({
      opslimit: this._opslimit,
      memlimit: this._memlimit,
    });
  }

  setOptions() {}
  public increaseWorkFactor(factor: number) {
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

  public hash(password: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this._sp.hash(password, (err, hashBuffer) => {
        if (err) return reject(err);
        resolve(hashBuffer);
      });
    });
  }

  public async verify(password: Buffer, passwordHash: Buffer) {
    const result = await new Promise<VerifyResult>((resolve, reject) => {
      this._sp.verify(password, passwordHash, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    switch (result) {
      case SecurePassword.INVALID_UNRECOGNIZED_HASH:
        throw new Error('Invalid/Unrecognized password hash');
      case SecurePassword.INVALID:
        return {valid: false, outdated: false};
      case SecurePassword.VALID_NEEDS_REHASH:
        return {valid: true, outdated: true};
      case SecurePassword.VALID:
        return {valid: true, outdated: false};
    }
    throw new Error('Invalid hash result type');
  }
}
