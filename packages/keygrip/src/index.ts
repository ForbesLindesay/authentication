import assert = require('assert');
import {
  createCipheriv,
  createHmac,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
  createDecipheriv,
} from 'crypto';

const KEY_SIZE = 32;

const MINIMUM_SECRET_KEY_LENGTH = 8;
const MINIMUM_PUBLIC_KEY_LENGTH = 8;
const RECOMMENDED_SECRET_KEY_LENGTH = KEY_SIZE * 2;
const RECOMMENDED_PUBLIC_KEY_LENGTH = KEY_SIZE;

const KDF_SALT = 'Keygrip';
const KDF_ITERATIONS = 100;
const HASH = 'sha';
const CIPHER = 'aes-256-cbc';

const HMAC_LENGTH = 32;
const IV_LENGTH = 16;

interface Key {
  encrypt: Buffer;
  hmac: Buffer;
}

export abstract class Keygrip {
  abstract pack(payload: Buffer): Buffer;
  abstract unpack(data: Buffer): Buffer | null;
  packString(payload: string): string {
    return this.pack(new Buffer(payload, 'utf8')).toString('base64');
  }
  unpackString(data: string): string | null {
    const payload = this.unpack(new Buffer(data, 'base64'));
    if (payload == null) return null;
    return payload.toString('utf8');
  }
}

export class KeygripSecret extends Keygrip {
  private readonly _keys: Key[];
  constructor(keys: ReadonlyArray<string | Buffer>) {
    super();
    this._keys = keys
      .map(key => {
        if (typeof key === 'string' && /^[0-9A-F]+$/i.test(key)) {
          return Buffer.from(key.toUpperCase(), 'hex');
        }
        return key;
      })
      .map((rawKey): Key => {
        if (rawKey.length < MINIMUM_SECRET_KEY_LENGTH) {
          throw new Error(
            `You cannot use keygrip with a key shorter than ` +
              `${MINIMUM_SECRET_KEY_LENGTH} bytes (which is ${MINIMUM_SECRET_KEY_LENGTH *
                2} ` +
              `hexidecimal characters). ` +
              `We recommend a key length of ${RECOMMENDED_SECRET_KEY_LENGTH} bytes. ` +
              `You can generate a secure key using the command: ` +
              `node -e "console.log(require('crypto').randomBytes(${RECOMMENDED_SECRET_KEY_LENGTH}).toString('hex'))"`,
          );
        }
        // Derive context-specific keys out of raw key inputs. The user is expected to provide
        // cryptographically secure keys, so a static salt and low iteration count are
        // sufficient.
        const key =
          Buffer.isBuffer(rawKey) && rawKey.length === KEY_SIZE * 2
            ? rawKey
            : pbkdf2Sync(
                rawKey,
                KDF_SALT,
                KDF_ITERATIONS,
                KEY_SIZE * 2,
                'sha512',
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
    const cipher = createCipheriv(CIPHER, key.encrypt, iv);
    const ciphertext = Buffer.concat([cipher.update(payload), cipher.final()]);

    const mac = createHmac(HASH, key.hmac)
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

  tryDecrypt(data: Buffer, keyIndex?: number): Buffer | null {
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

    // 32 byte hmac + 16 iv + at least one 16 block
    if (data.length < HMAC_LENGTH + IV_LENGTH + 16) return null;
    const mac = data.slice(0, HMAC_LENGTH);
    const iv = data.slice(HMAC_LENGTH, HMAC_LENGTH + IV_LENGTH);
    const ciphertext = data.slice(HMAC_LENGTH + IV_LENGTH, data.length);

    const actualMac = createHmac(HASH, key.hmac)
      .update(iv)
      .update(ciphertext)
      .digest();

    if (!timingSafeEqual(mac, actualMac)) {
      return null;
    }

    const cipher = createDecipheriv(CIPHER, key.encrypt, iv);
    return Buffer.concat([cipher.update(ciphertext), cipher.final()]);
  }

  pack(payload: Buffer): Buffer {
    return this.encrypt(payload);
  }
  unpack(data: Buffer): Buffer | null {
    return this.tryDecrypt(data);
  }
}

export class KeygripPublic extends Keygrip {
  private readonly _keys: Buffer[];
  constructor(keys: ReadonlyArray<string | Buffer>) {
    super();
    this._keys = keys
      .map(key => {
        if (typeof key === 'string' && /^[0-9A-F]+$/i.test(key)) {
          return Buffer.from(key.toUpperCase(), 'hex');
        }
        return key;
      })
      .map(rawKey => {
        if (rawKey.length < MINIMUM_PUBLIC_KEY_LENGTH) {
          throw new Error(
            `You cannot use keygrip with a key shorter than ` +
              `${MINIMUM_PUBLIC_KEY_LENGTH} bytes (which is ${MINIMUM_PUBLIC_KEY_LENGTH *
                2} ` +
              `hexidecimal characters). ` +
              `We recommend a key length of ${RECOMMENDED_PUBLIC_KEY_LENGTH} bytes. ` +
              `You can generate a secure key using the command: ` +
              `node -e "console.log(require('crypto').randomBytes(${RECOMMENDED_PUBLIC_KEY_LENGTH}).toString('hex'))"`,
          );
        }
        // Derive context-specific keys out of raw key inputs. The user is expected to provide
        // cryptographically secure keys, so a static salt and low iteration count are
        // sufficient.
        return Buffer.isBuffer(rawKey) && rawKey.length === KEY_SIZE
          ? rawKey
          : pbkdf2Sync(rawKey, KDF_SALT, KDF_ITERATIONS, KEY_SIZE, 'sha512');
      });
  }

  sign(payload: Buffer): Buffer {
    const key = this._keys[0];

    const mac = createHmac(HASH, key)
      .update(payload)
      .digest();

    assert(
      mac.length === HMAC_LENGTH,
      `Expected hmac length to be ${HMAC_LENGTH}`,
    );
    return Buffer.concat([mac, payload]);
  }

  tryVerify(data: Buffer, keyIndex?: number): Buffer | null {
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

    if (data.length < HMAC_LENGTH) return null;
    const mac = data.slice(0, HMAC_LENGTH);
    const payload = data.slice(HMAC_LENGTH, data.length);

    const actualMac = createHmac(HASH, key)
      .update(data)
      .digest();

    if (!timingSafeEqual(mac, actualMac)) {
      return null;
    }

    return payload;
  }

  pack(payload: Buffer): Buffer {
    return this.sign(payload);
  }
  unpack(data: Buffer): Buffer | null {
    return this.tryVerify(data);
  }
}

export class KeygripPassThrough extends Keygrip {
  pack(payload: Buffer): Buffer {
    return payload;
  }
  unpack(data: Buffer): Buffer {
    return data;
  }
}
