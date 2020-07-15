import './pbkdf2';
import SecureHashAPI from './api';
import fallbacks from './fallbacks';
import {
  Algorithm,
  getAlgorithmName,
  Options,
} from './implementations/SecureHashImplementation';
import Pbkdf2, {Pbkdf2Options} from './pbkdf2';

const implementation =
  fallbacks.find(i => i.algorithm === Algorithm.Pbkdf2) || fallbacks[0];
const defaultAPI = new SecureHashAPI(implementation);

export {Pbkdf2Options};

export function setDefaultImplementation<TAlgorithm extends Algorithm>(
  algorithm: TAlgorithm,
  options?: Options[TAlgorithm],
) {
  const implementation = fallbacks.find(i => i.algorithm === algorithm);

  if (!implementation) {
    throw new Error(
      `You must import the algorithm ${getAlgorithmName(
        algorithm,
      )} before you can use it.`,
    );
  }

  defaultAPI.setDefaultImplementation(implementation, options);
}

export const hash = defaultAPI.hash.bind(defaultAPI);
export const verify = defaultAPI.verify.bind(defaultAPI);

export default Pbkdf2;
