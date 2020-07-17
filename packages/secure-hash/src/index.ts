import createArgon2id, {
  hash,
  verify,
} from '@authentication/secure-hash-argon2id';

export {hash, verify};

export default createArgon2id;
