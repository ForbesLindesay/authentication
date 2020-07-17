import throat = require('throat');
import AlgorithmID, {getAlgorithmName} from './AlgorithmID';
import AlgoirthmImplementation from './AlgorithmImplementation';
import {parseOptions} from './AlgorithmOptions';
import AlgorithmOptions, {ParsedAlgorithmOptions} from './AlgorithmOptions';

const algorithms = new Map<AlgorithmID, AlgoirthmImplementation<AlgorithmID>>();

export {AlgorithmID, AlgorithmOptions, ParsedAlgorithmOptions};
export function registerAlgorithm<TAlgorithmID extends AlgorithmID>(
  algorithm: AlgoirthmImplementation<TAlgorithmID>,
) {
  if (!algorithm || typeof algorithm !== 'object') {
    throw new Error(`implementation must be an object`);
  }

  const name = getAlgorithmName(algorithm.id);

  if (!name) {
    throw new Error(`${algorithm.id} is not a valid algorithm ID `);
  }
  if (typeof algorithm.hash !== 'function') {
    throw new Error(`${name} should have a hash function`);
  }
  if (typeof algorithm.verify !== 'function') {
    throw new Error(`${name} should have a verify function`);
  }

  if (algorithms.has(algorithm.id)) {
    throw new Error(
      `The algorithm ${name} has already been registered. You cannot register more than one implementation of the same algorithm.`,
    );
  }
  algorithms.set(algorithm.id, algorithm);
}

export function registeredAlgorithms() {
  return [...algorithms.keys()];
}

function getAlgorithm<TAlgorithmID extends AlgorithmID>(
  algorithmID: TAlgorithmID | number,
): AlgoirthmImplementation<TAlgorithmID> {
  const algorithm = algorithms.get(algorithmID);
  if (!algorithm) {
    const name = getAlgorithmName(algorithmID);
    if (!name) {
      throw new Error(`The algorithm id ${algorithmID} is not recognized`);
    } else {
      throw new Error(
        `The algorithm ${name} has not been imported. You must import algorithms before you can use them.`,
      );
    }
  }
  return algorithm as AlgoirthmImplementation<TAlgorithmID>;
}

export interface SecureHash {
  hash(password: string): Promise<string>;
  verify(
    password: string,
    passwordHash: string,
    onUpdate: (passwordHash: string) => Promise<unknown>,
  ): Promise<boolean>;
}
export default function createSecureHash<TAlgorithmID extends AlgorithmID>(
  algorithm: TAlgorithmID,
  options?: AlgorithmOptions<TAlgorithmID>,
): SecureHash {
  const defaultImplementation = getAlgorithm(algorithm);
  const algorithmOptions = parseOptions(algorithm, options);

  const throttle = throat(algorithmOptions.parallelLimit);

  async function hashPassword(password: string): Promise<string> {
    const hash = await defaultImplementation.hash(
      Buffer.from(password),
      algorithmOptions,
    );
    return `${defaultImplementation.id.toString(10)}:${Buffer.from(
      hash.buffer,
      hash.byteOffset,
      hash.byteLength,
    ).toString('base64')}`;
  }

  return {
    async hash(password: string): Promise<string> {
      if (!password || typeof password !== 'string') {
        throw new TypeError('password should be a, non-empty, string');
      }
      return throttle(async () => {
        return await hashPassword(password);
      });
    },

    async verify(
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
          AlgorithmID.Argon2id;

      const passwordHashWithoutAlgorithmID = algorithmIDMatch
        ? passwordHash.substr(algorithmIDMatch[0].length)
        : passwordHash;

      const passwordBuf = Buffer.from(password, 'utf8');
      const hashBuf = Buffer.from(passwordHashWithoutAlgorithmID, 'base64');
      return await throttle(async () => {
        // hashed using the current algorithm
        if (algorithmID === algorithm) {
          const {valid, outdated} = await defaultImplementation.verify(
            passwordBuf,
            hashBuf,
            algorithmOptions,
          );
          if (valid === true) {
            if (outdated) {
              await onUpdate(await hashPassword(password));
            }
            return true;
          } else {
            return false;
          }
        }
        // hashed using legacy algorithm
        else {
          const implementation = getAlgorithm(algorithmID);
          const {valid} = await implementation.verify(passwordBuf, hashBuf);
          if (valid === true) {
            await onUpdate(await hashPassword(password));
            return true;
          } else {
            return false;
          }
        }
      });
    },
  };
}
