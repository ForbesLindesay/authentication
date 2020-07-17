const SecurePassword: typeof SecurePasswordType = require('secure-password');

export enum VerifyResult {
  INVALID_UNRECOGNIZED_HASH = SecurePassword.INVALID_UNRECOGNIZED_HASH,
  INVALID = SecurePassword.INVALID,
  VALID = SecurePassword.VALID,
  VALID_NEEDS_REHASH = SecurePassword.VALID_NEEDS_REHASH,
}
export interface Options {
  memlimit: number;
  opslimit: number;
}
export declare class SecurePasswordType {
  static readonly PASSWORD_BYTES_MIN: number;
  static readonly PASSWORD_BYTES_MAX: number;

  static readonly MEMLIMIT_MIN: number;
  static readonly MEMLIMIT_MAX: number;
  static readonly OPSLIMIT_MIN: number;
  static readonly OPSLIMIT_MAX: number;

  static readonly MEMLIMIT_DEFAULT: number;
  static readonly OPSLIMIT_DEFAULT: number;

  static readonly INVALID_UNRECOGNIZED_HASH: VerifyResult;
  static readonly INVALID: VerifyResult;
  static readonly VALID: VerifyResult;
  static readonly VALID_NEEDS_REHASH: VerifyResult;

  constructor(options: Options);
  hashSync(passwordBuf: Buffer): Buffer;
  hash(
    passwordBuf: Buffer,
    cb: (err: null | Error, hashBuf: Buffer) => any,
  ): void;
  verifySync(passwordBuf: Buffer, hashBuf: Buffer): VerifyResult;
  verify(
    passwordBuf: Buffer,
    hashBuf: Buffer,
    cb: (err: null | Error, result: VerifyResult) => any,
  ): void;
}

export default SecurePassword;
