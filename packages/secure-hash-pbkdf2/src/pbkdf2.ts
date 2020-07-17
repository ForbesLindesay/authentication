import {pbkdf2, randomFill, timingSafeEqual} from 'crypto';
import Configuration, {
  hashFunctionToString,
  CONFIG_BYTE_LENGTH,
  configToBuffer,
  configFromBuffer,
} from './Configuration';

async function hashWithSalt(
  password: Uint8Array,
  salt: Uint8Array,
  config: Configuration,
): Promise<Uint8Array> {
  return await new Promise<Buffer>((resolve, reject) => {
    pbkdf2(
      password,
      salt,
      config.iterations,
      config.keyLength,
      hashFunctionToString(config.hashFunction),
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey);
      },
    );
  });
}

export async function hash(
  password: Uint8Array,
  config: Configuration,
): Promise<Uint8Array> {
  const result = new Uint8Array(
    CONFIG_BYTE_LENGTH + config.saltLength + config.keyLength,
  );
  const salt = result.subarray(CONFIG_BYTE_LENGTH, config.saltLength);
  await new Promise((resolve, reject) => {
    randomFill(salt, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
  const hash = await hashWithSalt(password, salt, config);
  configToBuffer(
    config,
    new Uint32Array(result.buffer, result.byteOffset, CONFIG_BYTE_LENGTH),
  );
  result.set(hash, CONFIG_BYTE_LENGTH + salt.length);
  return result;
}

export async function verify(password: Uint8Array, passwordHash: Uint8Array) {
  const config = configFromBuffer(
    new Uint32Array(
      passwordHash.buffer,
      passwordHash.byteOffset,
      CONFIG_BYTE_LENGTH,
    ),
  );
  const salt = passwordHash.subarray(
    CONFIG_BYTE_LENGTH,
    CONFIG_BYTE_LENGTH + config.saltLength,
  );
  const expectedHash = passwordHash.subarray(
    CONFIG_BYTE_LENGTH + config.saltLength,
  );
  const actualHash = await hashWithSalt(password, salt, config);
  return {valid: timingSafeEqual(actualHash, expectedHash), config};
}
