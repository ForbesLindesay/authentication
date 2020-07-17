import createSecureHash, {
  registerAlgorithm,
  AlgorithmID,
  AlgorithmOptions,
} from '@authentication/secure-hash-core';
import {getDefaultConfig, configEquals} from './Configuration';
import * as pbkdf2 from './pbkdf2';

registerAlgorithm({
  id: AlgorithmID.Pbkdf2,
  async hash(password, options) {
    return await pbkdf2.hash(password, getDefaultConfig(options.iterations));
  },
  async verify(password, passwordHash, options) {
    const {valid, config} = await pbkdf2.verify(password, passwordHash);
    if (valid === true) {
      return {
        valid: true,
        outdated:
          !options ||
          !configEquals(config, getDefaultConfig(options.iterations)),
      };
    }
    return {valid: false, outdated: false};
  },
});

export type Pbkdf2Options = AlgorithmOptions<AlgorithmID.Pbkdf2>;

const {hash, verify} = createSecureHash(AlgorithmID.Pbkdf2, {});
export {hash, verify};

const createPbkdf2Hash = (options: Pbkdf2Options) =>
  createSecureHash(AlgorithmID.Pbkdf2, options);
export default createPbkdf2Hash;

module.exports = Object.assign(createPbkdf2Hash, {
  default: createPbkdf2Hash,
  hash,
  verify,
});
