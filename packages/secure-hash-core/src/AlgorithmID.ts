import {getNameMap} from './utils';

enum AlgorithmID {
  Argon2id = 1,
  Pbkdf2 = 2,
}

export default AlgorithmID;

const names = getNameMap(AlgorithmID);
export function getAlgorithmName(algorithm: AlgorithmID): string;
export function getAlgorithmName(algorithm: number): string | undefined;
export function getAlgorithmName(algorithm: number): string | undefined {
  return names.get(algorithm);
}
