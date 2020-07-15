import {getNameMap} from '../utils';

export enum Algorithm {
  Argon2id = 1,
  Pbkdf2 = 2,
}

export interface SecureHashOptions {
  minimumHashTime?: number | string;
  parallelLimit?: number;
}

export interface Argon2idOptions extends SecureHashOptions {
  opslimit?: number;
  memlimit?: number | string;
}

export interface Pbkdf2Options extends SecureHashOptions {
  iterations?: number;
}

export type Options = {
  [Algorithm.Argon2id]: Argon2idOptions;
  [Algorithm.Pbkdf2]: Pbkdf2Options;
};

export default interface SecureHashImplementation<
  TAlgorithm extends Algorithm
> {
  readonly algorithm: TAlgorithm;

  setOptions(options: Options[TAlgorithm]): void;
  increaseWorkFactor(factor: number): void;
  hash(password: Buffer): Promise<Buffer>;
  verify(
    password: Buffer,
    passwordHash: Buffer,
  ): Promise<{valid: boolean; outdated: boolean}>;
}

const names = getNameMap(Algorithm);
export function getAlgorithmName(algorithm: Algorithm): string;
export function getAlgorithmName(algorithm: number): string | undefined;
export function getAlgorithmName(algorithm: number): string | undefined {
  return names.get(algorithm);
}
