// This is based on https://www.npmjs.com/package/secure-password but with some
// effort to simplify the code where possible. It also removes one usage of
// allocUnsafe.

const sodium = require('sodium-native');
const assert = require('nanoassert');

const HASH_BYTES: number = sodium.crypto_pwhash_STRBYTES;

const PASSWORD_BYTES_MIN: number = sodium.crypto_pwhash_PASSWD_MIN;
const PASSWORD_BYTES_MAX: number = sodium.crypto_pwhash_PASSWD_MAX;

const MEMLIMIT_MIN: number = sodium.crypto_pwhash_MEMLIMIT_MIN;
const MEMLIMIT_MAX: number = sodium.crypto_pwhash_MEMLIMIT_MAX;
const OPSLIMIT_MIN: number = sodium.crypto_pwhash_OPSLIMIT_MIN;
const OPSLIMIT_MAX: number = sodium.crypto_pwhash_OPSLIMIT_MAX;

function validateLimits({
  opsLimit,
  memLimit,
}: {
  opsLimit: number;
  memLimit: number;
}) {
  assert(
    memLimit >= MEMLIMIT_MIN,
    'opts.memLimit must be at least MEMLIMIT_MIN (' + MEMLIMIT_MIN + ')',
  );
  assert(
    memLimit <= MEMLIMIT_MAX,
    'opts.memLimit must be at most MEMLIMIT_MAX (' + MEMLIMIT_MAX + ')',
  );

  assert(
    opsLimit >= OPSLIMIT_MIN,
    'opts.opsLimit must be at least OPSLIMIT_MIN (' + OPSLIMIT_MIN + ')',
  );
  assert(
    opsLimit <= OPSLIMIT_MAX,
    'opts.memLimit must be at most OPSLIMIT_MAX (' + OPSLIMIT_MAX + ')',
  );
}

function vaidatePassword(passwordBuf: Uint8Array) {
  assert(passwordBuf instanceof Uint8Array, 'passwordBuf must be Uint8Array');
  assert(
    passwordBuf.length >= PASSWORD_BYTES_MIN,
    'passwordBuf must be at least PASSWORD_BYTES_MIN (' +
      PASSWORD_BYTES_MIN +
      ')',
  );
  assert(
    passwordBuf.length < PASSWORD_BYTES_MAX,
    'passwordBuf must be shorter than PASSWORD_BYTES_MAX (' +
      PASSWORD_BYTES_MAX +
      ')',
  );
}

function validatePasswordHash(hashBuf: Uint8Array) {
  assert(hashBuf instanceof Uint8Array, 'hashBuf must be Uint8Array');
  assert(
    hashBuf.length === HASH_BYTES,
    'hashBuf must be HASH_BYTES (' + HASH_BYTES + ')',
  );

  const hashText = Buffer.from(hashBuf.buffer, hashBuf.byteOffset, 10).toString(
    'utf8',
  );
  if (!hashText.startsWith('$argon2i$') && !hashText.startsWith('$argon2id$')) {
    throw new Error('Invalid/Unrecognized password hash');
  }
}

export function needsRehash(
  hashBuf: Uint8Array,
  {opsLimit, memLimit}: {opsLimit: number; memLimit: number},
): boolean {
  validateLimits({opsLimit, memLimit});
  validatePasswordHash(hashBuf);
  const result = sodium.crypto_pwhash_str_needs_rehash(
    hashBuf,
    opsLimit,
    memLimit,
  );
  assert(typeof result === 'boolean');
  return result;
}

export async function hash(
  passwordBuf: Uint8Array,
  {opsLimit, memLimit}: {opsLimit: number; memLimit: number},
) {
  validateLimits({opsLimit, memLimit});
  vaidatePassword(passwordBuf);

  // sodium will overwrite all bytes but we do not use allocUnsafe out of
  // an abundance of caution
  const hashBuf = Buffer.alloc(HASH_BYTES);

  // creates a password hash with a random salt and stores all settings
  // along with the hash in hashBuf
  await new Promise((resolve, reject) => {
    sodium.crypto_pwhash_str_async(
      hashBuf,
      passwordBuf,
      opsLimit,
      memLimit,
      (err?: Error) => {
        if (err) return reject(err);
        else resolve();
      },
    );
  });

  validatePasswordHash(hashBuf);

  return hashBuf;
}

export async function verify(passwordBuf: Uint8Array, hashBuf: Uint8Array) {
  vaidatePassword(passwordBuf);
  validatePasswordHash(hashBuf);

  const isValid = await new Promise<boolean>((resolve, reject) => {
    sodium.crypto_pwhash_str_verify_async(
      hashBuf,
      passwordBuf,
      (err: Error | undefined, isValid: boolean) => {
        if (err) reject(err);
        else resolve(isValid);
      },
    );
  });
  assert(typeof isValid === 'boolean');
  return isValid;
}
