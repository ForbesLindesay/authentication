import assert = require('assert');
import {
  createCipheriv,
  createHmac,
  pbkdf2Sync,
  pbkdf2,
  randomBytes,
  timingSafeEqual,
  createDecipheriv,
} from 'crypto';

const KEY_SIZE = 32;

const KDF_SALT = 'Keygrip';
const KDF_ITERATIONS = 100;
const HMAC_ALGORITHM = 'sha512';
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

const HMAC_LENGTH = 64;
const IV_LENGTH = 16;

interface Key {
  encrypt: Buffer;
  hmac: Buffer;
}

export interface Result<T = Buffer> {
  payload: T;
  outdated: boolean;
}
export abstract class Keygrip {
  abstract pack(payload: Buffer): Buffer;
  abstract unpack(data: Buffer): Result | null;
  packString(payload: string): string {
    return this.pack(new Buffer(payload, 'utf8')).toString('base64');
  }
  unpackString(data: string): Result<string> | null {
    const result = this.unpack(new Buffer(data, 'base64'));
    if (result == null) return null;
    return {
      payload: result.payload.toString('utf8'),
      outdated: result.outdated,
    };
  }
}

function getKey(
  rawKey: string | Buffer,
  length: number,
  minimumInputLength: number,
): Buffer {
  if (typeof rawKey === 'string' && /^[0-9A-F]+$/i.test(rawKey)) {
    rawKey = Buffer.from(rawKey.toUpperCase(), 'hex');
  }
  if (rawKey.length < minimumInputLength) {
    throw new Error(
      `You cannot use keygrip with a key shorter than ` +
        `${minimumInputLength} bytes (i.e. ${minimumInputLength *
          2} hex encoded characters). ` +
        `We recommend a key length of ${length} bytes. ` +
        `You can generate a secure key using the command: ` +
        `node -e "console.log(require('crypto').randomBytes(${length}).toString('hex'))"`,
    );
  }
  // Derive context-specific keys out of raw key inputs. The user is expected to provide
  // cryptographically secure keys, so a static salt and low iteration count are
  // sufficient.
  return Buffer.isBuffer(rawKey) && rawKey.length === length
    ? rawKey
    : pbkdf2Sync(rawKey, KDF_SALT, KDF_ITERATIONS, length, 'sha512');
}
async function getKeyAsync(
  rawKey: string | Buffer,
  length: number,
  minimumInputLength: number,
): Promise<Buffer> {
  if (typeof rawKey === 'string' && /^[0-9A-F]+$/i.test(rawKey)) {
    rawKey = Buffer.from(rawKey.toUpperCase(), 'hex');
  }
  if (rawKey.length < minimumInputLength) {
    throw new Error(
      `You cannot use keygrip with a key shorter than ` +
        `${minimumInputLength} bytes (i.e. ${minimumInputLength *
          2} hex encoded characters). ` +
        `We recommend a key length of ${length} bytes. ` +
        `You can generate a secure key using the command: ` +
        `node -e "console.log(require('crypto').randomBytes(${length}).toString('hex'))"`,
    );
  }
  // Derive context-specific keys out of raw key inputs. The user is expected to provide
  // cryptographically secure keys, so a static salt and low iteration count are
  // sufficient.
  return Buffer.isBuffer(rawKey) && rawKey.length === length
    ? rawKey
    : await new Promise<Buffer>((resolve, reject) => {
        pbkdf2(
          rawKey,
          KDF_SALT,
          KDF_ITERATIONS,
          length,
          'sha512',
          (err, derivedkey) => {
            if (err) reject(err);
            else resolve(derivedkey);
          },
        );
      });
}

export class KeygripSecret extends Keygrip {
  private readonly _keys: Key[];
  static readonly RECOMMENDED_KEY_LENGTH = KEY_SIZE * 2;
  static readonly MINIMUM_KEY_LENGTH = 8;
  static createAsync(keys: ReadonlyArray<string | Buffer>) {
    return Promise.all(
      keys.map(key =>
        getKeyAsync(
          key,
          KeygripSecret.RECOMMENDED_KEY_LENGTH,
          KeygripSecret.MINIMUM_KEY_LENGTH,
        ),
      ),
    ).then(keys => new KeygripSecret(keys));
  }
  constructor(keys: ReadonlyArray<string | Buffer>) {
    super();
    this._keys = keys.map((rawKey): Key => {
      // Derive context-specific keys out of raw key inputs. The user is expected to provide
      // cryptographically secure keys, so a static salt and low iteration count are
      // sufficient.
      const key = getKey(
        rawKey,
        KeygripSecret.RECOMMENDED_KEY_LENGTH,
        KeygripSecret.MINIMUM_KEY_LENGTH,
      );

      return {
        encrypt: key.slice(0, KEY_SIZE),
        hmac: key.slice(KEY_SIZE, KEY_SIZE * 2),
      };
    });
  }

  encrypt(payload: Buffer): Buffer {
    const key = this._keys[0];
    const iv = randomBytes(16);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key.encrypt, iv);
    const ciphertext = Buffer.concat([cipher.update(payload), cipher.final()]);

    const mac = createHmac(HMAC_ALGORITHM, key.hmac)
      .update(iv)
      .update(ciphertext)
      .digest();

    assert(
      mac.length === HMAC_LENGTH,
      `Expected hmac length to be ${HMAC_LENGTH}`,
    );
    assert(iv.length === IV_LENGTH, `Expected iv length to be ${IV_LENGTH}`);
    assert(
      ciphertext.length >= 16,
      'Expected ciphertext length to be at least 16',
    );
    return Buffer.concat([mac, iv, ciphertext]);
  }

  tryDecrypt(data: Buffer, keyIndex?: number): Result | null {
    if (keyIndex === undefined) {
      for (let i = 0; i < this._keys.length; i++) {
        const message = this.tryDecrypt(data, i);
        if (message !== null) return message;
      }

      return null;
    }
    const key = this._keys[keyIndex];
    if (!key) {
      throw new Error('Invalid key index ' + keyIndex);
    }

    if (data.length < HMAC_LENGTH + IV_LENGTH) return null;
    const mac = data.slice(0, HMAC_LENGTH);
    const iv = data.slice(HMAC_LENGTH, HMAC_LENGTH + IV_LENGTH);
    const ciphertext = data.slice(HMAC_LENGTH + IV_LENGTH, data.length);

    const actualMac = createHmac(HMAC_ALGORITHM, key.hmac)
      .update(iv)
      .update(ciphertext)
      .digest();

    if (!timingSafeEqual(mac, actualMac)) {
      return null;
    }

    const cipher = createDecipheriv(ENCRYPTION_ALGORITHM, key.encrypt, iv);
    return {
      payload: Buffer.concat([cipher.update(ciphertext), cipher.final()]),
      outdated: keyIndex !== 0,
    };
  }

  pack(payload: Buffer): Buffer {
    return this.encrypt(payload);
  }
  unpack(data: Buffer): Result | null {
    return this.tryDecrypt(data);
  }
}

export class KeygripPublic extends Keygrip {
  private readonly _keys: Buffer[];
  static readonly RECOMMENDED_KEY_LENGTH = KEY_SIZE;
  static readonly MINIMUM_KEY_LENGTH = 8;
  static createAsync(keys: ReadonlyArray<string | Buffer>) {
    return Promise.all(
      keys.map(key =>
        getKeyAsync(
          key,
          KeygripPublic.RECOMMENDED_KEY_LENGTH,
          KeygripPublic.MINIMUM_KEY_LENGTH,
        ),
      ),
    ).then(keys => new KeygripPublic(keys));
  }
  constructor(keys: ReadonlyArray<string | Buffer>) {
    super();
    this._keys = keys.map(rawKey => {
      // Derive context-specific keys out of raw key inputs. The user is expected to provide
      // cryptographically secure keys, so a static salt and low iteration count are
      // sufficient.
      return getKey(
        rawKey,
        KeygripPublic.RECOMMENDED_KEY_LENGTH,
        KeygripPublic.MINIMUM_KEY_LENGTH,
      );
    });
  }

  sign(payload: Buffer): Buffer {
    const key = this._keys[0];

    const mac = createHmac(HMAC_ALGORITHM, key)
      .update(payload)
      .digest();

    assert(
      mac.length === HMAC_LENGTH,
      `Expected hmac length to be ${HMAC_LENGTH}`,
    );
    return Buffer.concat([mac, payload]);
  }

  tryVerify(data: Buffer, keyIndex?: number): Result | null {
    if (keyIndex === undefined) {
      for (let i = 0; i < this._keys.length; i++) {
        const message = this.tryVerify(data, i);
        if (message !== null) return message;
      }

      return null;
    }
    const key = this._keys[keyIndex];
    if (!key) {
      throw new Error('Invalid key index ' + keyIndex);
    }

    if (data.length < HMAC_LENGTH) return null;
    const mac = data.slice(0, HMAC_LENGTH);
    const payload = data.slice(HMAC_LENGTH, data.length);

    const actualMac = createHmac(HMAC_ALGORITHM, key)
      .update(data)
      .digest();

    if (!timingSafeEqual(mac, actualMac)) {
      return null;
    }

    return {payload, outdated: keyIndex !== 0};
  }

  pack(payload: Buffer): Buffer {
    return this.sign(payload);
  }
  unpack(data: Buffer): Result | null {
    return this.tryVerify(data);
  }
}

export class KeygripPassThrough extends Keygrip {
  pack(payload: Buffer): Buffer {
    return payload;
  }
  unpack(data: Buffer): Result {
    return {payload: data, outdated: false};
  }
}
