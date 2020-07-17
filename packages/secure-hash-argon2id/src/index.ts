import createSecureHash, {
  registerAlgorithm,
  AlgorithmID,
  AlgorithmOptions,
} from '@authentication/secure-hash-core';
import * as sodium from './sodium-native';

registerAlgorithm({
  id: AlgorithmID.Argon2id,
  async hash(password, options) {
    return await sodium.hash(
      Buffer.from(password.buffer, password.byteOffset, password.byteLength),
      options,
    );
  },
  async verify(password, passwordHash, options) {
    const passwordHashBuf = Buffer.from(
      passwordHash.buffer,
      passwordHash.byteOffset,
      passwordHash.byteLength,
    );
    const valid = await sodium.verify(
      Buffer.from(password.buffer, password.byteOffset, password.byteLength),
      passwordHashBuf,
    );
    if (valid === true) {
      return {
        valid: true,
        outdated: !options || sodium.needsRehash(passwordHashBuf, options),
      };
    }
    return {valid: false, outdated: false};
  },
});

export type Argon2idOptions = AlgorithmOptions<AlgorithmID.Argon2id>;

const {hash, verify} = createSecureHash(AlgorithmID.Argon2id, {});
export {hash, verify};

const createArgon2idHash = (options: Argon2idOptions) =>
  createSecureHash(AlgorithmID.Argon2id, options);
export default createArgon2idHash;

module.exports = Object.assign(createArgon2idHash, {
  default: createArgon2idHash,
  hash,
  verify,
});
